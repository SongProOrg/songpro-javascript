import { IMeasure, IPart, ISection, ISong, Line } from "./models";

const SECTION_REGEX = /#\s*([^$]*)/;
const ATTRIBUTE_REGEX = /@(\w*)=([^%]*)/;
const CUSTOM_ATTRIBUTE_REGEX = /!(\w*)=([^%]*)/;
const CHORDS_AND_LYRICS_REGEX = /(\[[\w#b/]+])?([\w\s',.!()_\-"]*)/gi;

const MEASURES_REGEX = /([[\w#b/\]+\]\s]+)[|]*/gi;
const CHORDS_REGEX = /\[([\w#b+/]+)]?/gi;
const COMMENT_REGEX = />\s*([^$]*)/;

export default class SongPro {
  public static parse(text: string): ISong {
    const song: ISong = {
      attrs: {},
      sections: [],
      custom: {},
    };
    let currentSection: ISection | undefined;

    const linesArr = text.split("\n");

    for (const line of linesArr) {
      if (line.startsWith("@")) {
        this.processAttribute(song, line);
      } else if (line.startsWith("!")) {
        this.processCustomAttribute(song, line);
      } else if (line.startsWith("#")) {
        currentSection = this.processSection(song, line);
      } else {
        this.processLyricsAndChords(song, currentSection, line);
      }
    }

    return song;
  }

  private static processAttribute(song: ISong, line: string): void {
    const matches = ATTRIBUTE_REGEX.exec(line);

    if (matches?.[1] != null) {
      song.attrs[matches[1]] = matches[2];
    }
  }

  private static processCustomAttribute(song: ISong, line: string): void {
    const matches = CUSTOM_ATTRIBUTE_REGEX.exec(line);

    if (matches?.[1] != null && matches[2] != null) {
      song.custom[matches[1]] = matches[2];
    }
  }

  private static processSection(song: ISong, line: string): ISection {
    const matches = SECTION_REGEX.exec(line);

    const currentSection: ISection = {
      name: "",
      lines: [],
    };

    if (matches?.[1] != null) {
      currentSection.name = matches[1];
      song.sections.push(currentSection);
    }

    return currentSection;
  }

  private static processLyricsAndChords(
    song: ISong,
    currentSection: ISection | undefined,
    text: string
  ): void {
    if (text !== "") {
      if (currentSection === undefined) {
        currentSection = {
          name: "",
          lines: [],
        };
        song.sections.push(currentSection);
      }

      const line = this.buildLine(text);
      currentSection.lines.push(line);
    }
  }

  private static buildLine(text: string): Line {
    const line = new Line();

    if (text.startsWith("|-")) {
      line.tablature = text;
    } else if (text.startsWith("| ")) {
      line.measures = this.getMeasures(text);
    } else if (text.startsWith(">")) {
      line.comment = this.getComment(text);
    } else {
      const captures = this.scan(text, CHORDS_AND_LYRICS_REGEX);
      const groupedCaptures = this.chunk(captures, 2);
      for (const group of groupedCaptures) {
        const part = this.getPart(group[0], group[1]);

        if (!(part.chord === "" && part.lyric === "")) {
          line.parts.push(part);
        }
      }
    }

    return line;
  }

  private static getMeasures(text: string): IMeasure[] {
    const capturesList = this.scan(text, MEASURES_REGEX);

    const measures: IMeasure[] = [];

    for (const capture of capturesList) {
      let chords: (string | undefined)[] = [];
      if (capture !== undefined) {
        chords = this.scan(capture, CHORDS_REGEX);
      }

      const measure: IMeasure = {
        chords: [],
      };
      measure.chords = chords;
      measures.push(measure);
    }

    return measures;
  }

  private static getComment(text: string): string {
    const matches = COMMENT_REGEX.exec(text);

    //If we got to this point, the regex will always match and have the first capture group
    //We can confidently tell typescript that these values will never be null, even with empty comment sections
    return matches![1]!.trim();
  }

  private static getPart(
    inputChord: string | undefined,
    inputLyric: string | undefined
  ): IPart {
    let chord: string | undefined;
    let lyric = "";

    if(inputLyric != null){
      lyric = inputLyric;
    }

    if (inputChord !== undefined) {
      chord = inputChord.replace("[", "").replace("]", "");
    }

    if (chord === undefined) {
      chord = "";
    }

    const part: IPart = {
      chord: chord.trim(),
      lyric: lyric.trim(),
    };

    return part;
  }

  private static chunk<T>(
    arr: T[],
    chunkSize: number,
    cache: T[][] = []
  ): T[][] {
    //Adapted from https://youmightnotneed.com/lodash/#chunk
    //Chunk size must be greater than 1
    const tmp = [...arr];
    while (tmp.length) cache.push(tmp.splice(0, chunkSize));
    return cache;
  }

  private static scan(str: string, pattern: RegExp): (string | undefined)[] {
    //Note: all patterns used here must have the 'global' flag set");
    return [...str.matchAll(pattern)].flatMap((m) => m.slice(1));
  }
}

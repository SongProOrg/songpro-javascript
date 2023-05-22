import { Line } from "./Line";
import { chunk, flatten } from "lodash";
import { IMeasure, IPart, ISection, ISong } from "./types";

const SECTION_REGEX = /#\s*([^$]*)/;
const ATTRIBUTE_REGEX = /@(\w*)=([^%]*)/;
const CUSTOM_ATTRIBUTE_REGEX = /!(\w*)=([^%]*)/;
const CHORDS_AND_LYRICS_REGEX = /(\[[\w#b/]+])?([\w\s',.!()_\-"]*)/gi;

const MEASURES_REGEX = /([[\w#b/\]+\]\s]+)[|]*/gi;
const CHORDS_REGEX = /\[([\w#b+/]+)]?/gi;
const COMMENT_REGEX = />\s*([^$]*)/;

export class SongPro {
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

    if (matches == null || matches[1] == null || matches[2] == null) {
      return;
    }

    song.attrs[matches[1]] = matches[2];
  }

  private static processCustomAttribute(song: ISong, line: string): void {
    const matches = CUSTOM_ATTRIBUTE_REGEX.exec(line);

    if (matches == null || matches[1] == null || matches[2] == null) {
      return;
    }

    song.custom[matches[1]] = matches[2];
  }

  private static processSection(
    song: ISong,
    line: string
  ): ISection | undefined {
    const matches = SECTION_REGEX.exec(line);

    if (matches == null || matches[1] == null) {
      return;
    }

    const currentSection: ISection = {
      name: matches[1],
      lines: [],
    };

    song.sections.push(currentSection);

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
      const groups = chunk(captures, 2);

      for (const group of groups) {
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

  private static getComment(text: string): string | undefined {
    const matches = COMMENT_REGEX.exec(text);

    if (matches == null || matches[1] == null) {
      return undefined;
    }

    return matches[1].trim();
  }

  private static getPart(
    inputChord: string | undefined,
    inputLyric: string | undefined
  ): IPart {
    let chord: string | undefined;
    const lyric = inputLyric === undefined ? "" : inputLyric;

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

  private static scan(str: string, pattern: RegExp): (string | undefined)[] {
    if (!pattern.global) throw new Error("regex must have 'global' flag set");

    const results: string[][] = [];
    str.replace(pattern, function () {
      results.push(Array.prototype.slice.call(arguments, 1, -2));
      return "";
    });

    return flatten(results);
  }
}

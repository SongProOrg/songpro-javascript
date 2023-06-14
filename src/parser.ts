import {
  ISongProLine,
  ISongProMeasure,
  ISongProPart,
  ISongProSection,
  ISongProSong,
} from "./parser.model";

//No need to export this class, consumers have no need for it. The interface is exported anyway.
class Line implements ISongProLine {
  parts: ISongProPart[] = [];
  measures?: ISongProMeasure[];
  tablature?: string;
  comment?: string;

  //These methods use TypeScript type predicates
  // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
  // When these functions are used it will assure the compiler that these types do exist
  // without the developer having to add manual checks
  hasTablature(): this is { tablature: string } {
    return this.tablature !== undefined;
  }

  hasMeasures(): this is { measures: ISongProMeasure[] } {
    return this.measures !== undefined;
  }

  hasComment(): this is { comment: string } {
    return this.comment !== undefined;
  }
}

export class Parser {
  private readonly SECTION_REGEX = /#\s*([^$]*)/;
  private readonly ATTRIBUTE_REGEX = /@(\w*)=([^%]*)/;
  private readonly CUSTOM_ATTRIBUTE_REGEX = /!(\w*)=([^%]*)/;
  private readonly CHORDS_AND_LYRICS_REGEX = /(\[[\w#b/]+])?([\w\s',.!()_\-"]*)/gi;

  private readonly MEASURES_REGEX = /([[\w#b/\]+\]\s]+)[|]*/gi;
  private readonly CHORDS_REGEX = /\[([\w#b+/]+)]?/gi;
  private readonly COMMENT_REGEX = />\s*([^$]*)/;

  parse(text: string): ISongProSong {
    const song: ISongProSong = {
      attrs: {},
      sections: [],
      custom: {},
    };
    let currentSection: ISongProSection | undefined;

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

  private processAttribute(song: ISongProSong, line: string): void {
    const matches = this.ATTRIBUTE_REGEX.exec(line);

    if (matches?.[1] != null) {
      song.attrs[matches[1]] = matches[2];
    }
  }

  private processCustomAttribute(song: ISongProSong, line: string): void {
    const matches = this.CUSTOM_ATTRIBUTE_REGEX.exec(line);

    //We need to do this check as-is here since the 2nd match could possibly be null sometimes!
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (matches?.[1] != null && matches[2] != null) {
      song.custom[matches[1]] = matches[2];
    }
  }

  private processSection(song: ISongProSong, line: string): ISongProSection {
    //This will always return a match no matter what
    //Here it is safe to do a non-null assertion with !
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const matches = this.SECTION_REGEX.exec(line)!;

    const currentSection: ISongProSection = {
      name: "",
      lines: [],
    };

    //We need to do this check as-is here since the 2nd match could possibly be null sometimes!
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (matches[1] != null) {
      currentSection.name = matches[1];
      song.sections.push(currentSection);
    }

    return currentSection;
  }

  private processLyricsAndChords(
    song: ISongProSong,
    currentSection: ISongProSection | undefined,
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

  private buildLine(text: string): Line {
    const line = new Line();

    if (text.startsWith("|-")) {
      line.tablature = text;
    } else if (text.startsWith("| ")) {
      line.measures = this.getMeasures(text);
    } else if (text.startsWith(">")) {
      line.comment = this.getComment(text);
    } else {
      const captures = this.scan(text, this.CHORDS_AND_LYRICS_REGEX);
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

  private getMeasures(text: string): ISongProMeasure[] {
    const capturesList = this.scan(text, this.MEASURES_REGEX);

    const measures: ISongProMeasure[] = [];

    for (const capture of capturesList) {
      let chords: (string | undefined)[] = [];
      if (capture !== undefined) {
        chords = this.scan(capture, this.CHORDS_REGEX);
      }

      const measure: ISongProMeasure = {
        chords: [],
      };
      measure.chords = chords;
      measures.push(measure);
    }

    return measures;
  }

  private getComment(text: string): string {
    //This will always return a match no matter what
    //Here it is safe to do a non-null assertions with !
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const matches = this.COMMENT_REGEX.exec(text)!;

    //If we got to this point, the regex will always match and have the first capture group
    //We can confidently tell typescript that these values will never be null, even with empty comment sections
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return matches[1]!.trim();
  }

  private getPart(inputChord: string | undefined, inputLyric: string | undefined): ISongProPart {
    let chord: string | undefined;
    let lyric = "";

    if (inputLyric != null) {
      lyric = inputLyric;
    }

    if (inputChord !== undefined) {
      chord = inputChord.replace("[", "").replace("]", "");
    }

    if (chord === undefined) {
      chord = "";
    }

    const part: ISongProPart = {
      chord: chord.trim(),
      lyric: lyric.trim(),
    };

    return part;
  }

  private chunk<T>(arr: T[], chunkSize: number, cache: T[][] = []): T[][] {
    //Adapted from https://youmightnotneed.com/lodash/#chunk
    //Chunk size must be greater than 1
    const tmp = [...arr];
    while (tmp.length) cache.push(tmp.splice(0, chunkSize));
    return cache;
  }

  private scan(str: string, pattern: RegExp): (string | undefined)[] {
    //Note: all patterns used here must have the 'global' flag set");
    return [...str.matchAll(pattern)].flatMap((m) => m.slice(1));
  }
}

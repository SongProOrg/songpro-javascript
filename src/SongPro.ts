import { ISong } from "./Song";
import { ISection } from "./Section";
import { Line } from "./Line";
import { chunk, flatten } from "lodash";
import { IMeasure as IMeasure } from "./Measure";
import { IPart } from "./Part";

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

    const lines = text.split("\n");

    for (const text of lines) {
      if (text.startsWith("@")) {
        this.processAttribute(song, text);
      } else if (text.startsWith("!")) {
        this.processCustomAttribute(song, text);
      } else if (text.startsWith("#")) {
        currentSection = this.processSection(song, text);
      } else {
        this.processLyricsAndChords(song, currentSection, text);
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

  private static processSection(song: ISong, line: string): ISection | undefined {
    const matches = SECTION_REGEX.exec(line);

    if (matches == null || matches[1] == null) {
      return
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
    if (text === "") {
      return;
    }

    if (currentSection === undefined) {
      currentSection = {
        name: "",
        lines: [],
      };
      song.sections.push(currentSection);
    }

    const line = new Line();

    if (text.startsWith("|-")) {
      line.tablature = text;
    } else if (text.startsWith("| ")) {
      let captures = this.scan(text, MEASURES_REGEX);
      captures = flatten(captures);

      const measures = [];

      for (const capture of captures) {
        let chords = this.scan(capture, CHORDS_REGEX);
        chords = flatten(chords);

        const measure: IMeasure = {
          chords: [],
        };
        measure.chords = chords;
        measures.push(measure);
      }

      line.measures = measures;
    } else if (text.startsWith(">")) {
      const matches = COMMENT_REGEX.exec(text);

      if (matches == null || matches[1] == null) {
        return;
      }

      line.comment = matches[1].trim();
    } else {
      let captures = this.scan(text, CHORDS_AND_LYRICS_REGEX);
      captures = flatten(captures);
      const groups = chunk(captures, 2);

      for (const group of groups) {
        let chord = group[0];
        let lyric = group[1];

        if (chord) {
          chord = chord.replace("[", "").replace("]", "");
        }

        if (chord === undefined) {
          chord = "";
        }
        if (lyric === undefined) {
          lyric = "";
        }

        const part: IPart = {
          chord: chord.trim(),
          lyric: lyric.trim()
        };

        if (!(part.chord === "" && part.lyric === "")) {
          line.parts.push(part);
        }
      }
    }

    currentSection.lines.push(line);
  }

  private static scan(str: string, pattern: RegExp): any[] {
    if (!pattern.global) throw new Error("regex must have 'global' flag set");
    //@ts-expect-error
    const results = [];
    //@ts-expect-error
    str.replace(pattern, () => {
      results.push(Array.prototype.slice.call(arguments, 1, -2));
    });
    //@ts-expect-error
    return results;
  }
}

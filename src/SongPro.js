import { Song } from "./Song";
import { Section } from "./Section";
import { Line } from "./Line";
import { chunk, flatten, trim } from "lodash";
import { Part } from "./Part";
import { Measure } from "./Measure";

const SECTION_REGEX = /#\s*([^$]*)/;
const ATTRIBUTE_REGEX = /@(\w*)=([^%]*)/;
const CUSTOM_ATTRIBUTE_REGEX = /!(\w*)=([^%]*)/;
const CHORDS_AND_LYRICS_REGEX = /(\[[\w#b/]+])?([\w\s',.!()_\-"]*)/gi;

const MEASURES_REGEX = /([[\w#b/\]+\]\s]+)[|]*/gi;
const CHORDS_REGEX = /\[([\w#b+/]+)]?/gi;
const COMMENT_REGEX = />\s*([^$]*)/;

export class SongPro {
  static parse(text) {
    const song = new Song();
    let currentSection = null;

    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];

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

  static processAttribute(song, line) {
    const matches = ATTRIBUTE_REGEX.exec(line);

    if (matches == null) {
      return;
    }

    song.attrs[matches[1]] = matches[2];
  }

  static processCustomAttribute(song, line) {
    const matches = CUSTOM_ATTRIBUTE_REGEX.exec(line);

    if (matches == null) {
      return;
    }

    song.custom[matches[1]] = matches[2];
  }

  static processSection(song, line) {
    const matches = SECTION_REGEX.exec(line);

    if (matches == null) {
      return;
    }

    const name = matches[1];
    const currentSection = new Section(name);
    song.sections.push(currentSection);

    return currentSection;
  }

  static processLyricsAndChords(song, currentSection, text) {
    if (text === "") {
      return;
    }

    if (currentSection == null) {
      currentSection = new Section("");
      song.sections.push(currentSection);
    }

    const line = new Line();

    if (text.startsWith("|-")) {
      line.tablature = text;
    } else if (text.startsWith("| ")) {
      let captures = this.scan(text, MEASURES_REGEX);
      captures = flatten(captures);

      const measures = [];

      for (let i = 0; i < captures.length; i++) {
        let chords = this.scan(captures[i], CHORDS_REGEX);
        chords = flatten(chords);

        const measure = new Measure();
        measure.chords = chords;
        measures.push(measure);
      }

      line.measures = measures;
    } else if (text.startsWith(">")) {
      const matches = COMMENT_REGEX.exec(text);

      if (matches == null) {
        return;
      }

      const comment = matches[1]; // strip!
      line.comment = comment;
    } else {
      let captures = this.scan(text, CHORDS_AND_LYRICS_REGEX);
      captures = flatten(captures);
      const groups = chunk(captures, 2);

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        let chord = group[0];
        let lyric = group[1];

        const part = new Part();

        if (chord) {
          chord = chord.replace("[", "").replace("]", "");
        }

        if (chord === undefined) {
          chord = "";
        }
        if (lyric === undefined) {
          lyric = "";
        }

        part.chord = trim(chord);
        part.lyric = trim(lyric);

        if (!(part.chord === "" && part.lyric === "")) {
          line.parts.push(part);
        }
      }
    }

    currentSection.lines.push(line);
  }

  static scan(string, regex) {
    if (!regex.global) throw new Error("regex must have 'global' flag set");
    const results = [];
    string.replace(regex, function () {
      results.push(Array.prototype.slice.call(arguments, 1, -2));
    });
    return results;
  }
}

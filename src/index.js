import {Song} from "./Song";
import {Section} from "./Section";
import {chunk, flatten, trim} from "lodash";
import {Part} from "./Part";
import {Line} from "./Line";

export class SongPro {
  static parse(text) {
    let song = new Song();
    let currentSection = null;

    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      let text = lines[i];
      if (text.startsWith('@')) {
        this.processAttribute(song, text)
      } else if (text.startsWith('#')) {
        currentSection = this.processSection(song, text)
      } else {
        this.processLyricsAndChords(song, currentSection, text);
      }
    }

    return song;
  }

  static processAttribute(song, line) {
    const matches = /@(\w*)=([^%]*)/.exec(line);

    if (matches == null) {
      return;
    }

    song.attrs[matches[1]] = matches[2];
  }

  static processSection(song, line) {
    const matches = /#\s*([^$]*)/.exec(line);

    if (matches == null) {
      return;
    }

    let name = matches[1];
    let currentSection = new Section(name);
    song.sections.push(currentSection);

    return currentSection;
  }

  static processLyricsAndChords(song, currentSection, text) {
    if (text === '') {
      return;
    }

    if (currentSection == null) {
      currentSection = new Section('');
      song.sections.push(currentSection);
    }

    let line = new Line();

    let captures = this.scan(text, /(\[[\w#b/]+])?([\w\s',.!()_\-"]*)/gi);
    captures = flatten(captures);
    let groups = chunk(captures, 2);


    for (let i = 0; i < groups.length; i++) {
      let group = groups[i];
      let chord = group[0];
      let lyric = group[1];

      let part = new Part();

      if (chord) {
        chord = chord.replace('[','').replace(']','');
      }

      if (chord === undefined) { chord = ""}
      if (lyric === undefined) { lyric = ""}

      part.chord = trim(chord);
      part.lyric = trim(lyric);

      if (!(part.chord === "" && part.lyric === "")) {
        line.parts.push(part);
      }
    }

    currentSection.lines.push(line);
  }

  static scan(string, regex) {
    if (!regex.global) throw new Error("regex must have 'global' flag set");
    var results = [];
    string.replace(regex, function() {
      results.push(Array.prototype.slice.call(arguments, 1, -2));
    });
    return results;
  };
}

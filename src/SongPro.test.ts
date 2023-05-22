import { SongPro } from "./SongPro";

test("attributes", () => {
  const song = SongPro.parse(`
@title=Bad Moon Rising
@artist=Creedence Clearwater Revival
@capo=1st Fret
@key=C# Minor
@tempo=120
@year=1975
@album=Foo Bar Baz
@tuning=Eb Standard
`);

  expect(song.attrs.title).toEqual("Bad Moon Rising");
  expect(song.attrs.artist).toEqual("Creedence Clearwater Revival");
  expect(song.attrs.capo).toEqual("1st Fret");
  expect(song.attrs.key).toEqual("C# Minor");
  expect(song.attrs.tempo).toEqual("120");
  expect(song.attrs.year).toEqual("1975");
  expect(song.attrs.album).toEqual("Foo Bar Baz");
  expect(song.attrs.tuning).toEqual("Eb Standard");
});

test("custom attributes", () => {
  const song = SongPro.parse(`
!difficulty=Easy
!spotify_url=https://open.spotify.com/track/5zADxJhJEzuOstzcUtXlXv?si=SN6U1oveQ7KNfhtD2NHf9A
`);

  expect(song.custom["difficulty"]).toEqual("Easy");
  expect(song.custom["spotify_url"]).toEqual(
    "https://open.spotify.com/track/5zADxJhJEzuOstzcUtXlXv?si=SN6U1oveQ7KNfhtD2NHf9A"
  );
});

test("sections", () => {
  const song = SongPro.parse("# Verse 1");

  expect(song.sections.length).toBe(1);
  expect(song.sections[0]!.name).toEqual("Verse 1");
});

test("multiple sections", () => {
  const song = SongPro.parse(`
# Verse 1
# Chorus
`);

  expect(song.sections.length).toBe(2);
  expect(song.sections[0]!.name).toEqual("Verse 1");
  expect(song.sections[1]!.name).toEqual("Chorus");
});

test("lyrics", () => {
  const song = SongPro.parse("I don't see! a bad, moon a-rising. (a-rising)");

  expect(song.sections.length).toBe(1);
  expect(song.sections[0]!.lines.length).toBe(1);
  expect(song.sections[0]!.lines[0]!.parts.length).toBe(1);
  expect(song.sections[0]!.lines[0]!.parts[0]!.lyric).toEqual(
    "I don't see! a bad, moon a-rising. (a-rising)"
  );
});

test("chords", () => {
  const song = SongPro.parse("[D] [D/F#] [C] [A7]");
  expect(song.sections.length).toBe(1);
  expect(song.sections[0]!.lines.length).toBe(1);
  expect(song.sections[0]!.lines[0]!.parts.length).toBe(4);
  expect(song.sections[0]!.lines[0]!.parts[0]!.chord).toEqual("D");
  expect(song.sections[0]!.lines[0]!.parts[0]!.lyric).toEqual("");
  expect(song.sections[0]!.lines[0]!.parts[1]!.chord).toEqual("D/F#");
  expect(song.sections[0]!.lines[0]!.parts[1]!.lyric).toEqual("");
  expect(song.sections[0]!.lines[0]!.parts[2]!.chord).toEqual("C");
  expect(song.sections[0]!.lines[0]!.parts[2]!.lyric).toEqual("");
  expect(song.sections[0]!.lines[0]!.parts[3]!.chord).toEqual("A7");
  expect(song.sections[0]!.lines[0]!.parts[3]!.lyric).toEqual("");
});

test("chord and lyrics", () => {
  const song = SongPro.parse("[G]Don't go 'round tonight");

  expect(song.sections.length).toEqual(1);
  expect(song.sections[0]!.lines.length).toEqual(1);
  expect(song.sections[0]!.lines[0]!.parts.length).toEqual(1);
  expect(song.sections[0]!.lines[0]!.parts[0]!.chord).toEqual("G");
  expect(song.sections[0]!.lines[0]!.parts[0]!.lyric).toEqual(
    "Don't go 'round tonight"
  );
});

test("lyrics before chords", () => {
  const song = SongPro.parse("It's [D]bound to take your life");

  expect(song.sections.length).toEqual(1);
  expect(song.sections[0]!.lines.length).toEqual(1);
  expect(song.sections[0]!.lines[0]!.parts.length).toEqual(2);
  expect(song.sections[0]!.lines[0]!.parts[0]!.chord).toEqual("");
  expect(song.sections[0]!.lines[0]!.parts[0]!.lyric).toEqual("It's");
  expect(song.sections[0]!.lines[0]!.parts[1]!.chord).toEqual("D");
  expect(song.sections[0]!.lines[0]!.parts[1]!.lyric).toEqual(
    "bound to take your life"
  );
});

test("measures", () => {
  const song = SongPro.parse(`
# Instrumental

| [A] [B] | [C] | [D] [E] [F] [G] |
`);

  expect(song.sections.length).toEqual(1);
  expect(song.sections[0]!.lines[0]!.hasMeasures()).toEqual(true);
  expect(song.sections[0]!.lines[0]!.measures!.length).toEqual(3);
  expect(song.sections[0]!.lines[0]!.measures![0]!.chords).toEqual(["A", "B"]);
  expect(song.sections[0]!.lines[0]!.measures![1]!.chords).toEqual(["C"]);
  expect(song.sections[0]!.lines[0]!.measures![2]!.chords).toEqual([
    "D",
    "E",
    "F",
    "G",
  ]);
});

test("tablature", () => {
  const song = SongPro.parse(`
# Riff

|-3---5-|
|---4---|
`);
  expect(song.sections.length).toEqual(1);
  expect(song.sections[0]!.lines[0]!.hasTablature()).toEqual(true);
  expect(song.sections[0]!.lines[0]!.tablature).toEqual("|-3---5-|");
  expect(song.sections[0]!.lines[1]!.hasTablature()).toEqual(true);
  expect(song.sections[0]!.lines[1]!.tablature).toEqual("|---4---|");
});

test("comments", () => {
  const song = SongPro.parse(`
# Comment

> This is a comment.
`);

  expect(song.sections.length).toEqual(1);
  expect(song.sections[0]!.lines[0]!.hasComment()).toEqual(true);
  expect(song.sections[0]!.lines[0]!.comment).toEqual("This is a comment.");
});

describe("Edge Cases", () => {
  test("Empty Song", () => {
    const song = SongPro.parse(" ");
    expect(song.sections.length).toBe(1);
    expect(song.sections[0]!.lines.length).toBe(1);
    expect(song.sections[0]!.lines[0]!.parts.length).toBe(0);
  });

  test("Empty Attribute", () => {
    const song = SongPro.parse(`
@
`);

    expect(song.attrs.title).toBeUndefined();
    expect(song.attrs.artist).toBeUndefined();
    expect(song.attrs.capo).toBeUndefined();
    expect(song.attrs.key).toBeUndefined();
    expect(song.attrs.tempo).toBeUndefined();
    expect(song.attrs.year).toBeUndefined();
    expect(song.attrs.album).toBeUndefined();
    expect(song.attrs.tuning).toBeUndefined();
  });

  test("Broken Attribute", () => {
    const song = SongPro.parse(`
@title=
`);

    expect(song.attrs.title).toEqual("");
    expect(song.attrs.artist).toBeUndefined();
    expect(song.attrs.capo).toBeUndefined();
    expect(song.attrs.key).toBeUndefined();
    expect(song.attrs.tempo).toBeUndefined();
    expect(song.attrs.year).toBeUndefined();
    expect(song.attrs.album).toBeUndefined();
    expect(song.attrs.tuning).toBeUndefined();
  });

  test("Empty/Broken Custom Attribute", () => {
    const song = SongPro.parse(`
@
`);

    expect(song.custom).toEqual({});
  });

  test("Empty/Broken Comments", () => {
    const song = SongPro.parse(`
#

>
`);

    expect(song.sections.length).toEqual(1);
    expect(song.sections[0]!.lines[0]!.hasComment()).toEqual(true);
    expect(song.sections[0]!.lines[0]!.comment).toEqual("");
  });
});

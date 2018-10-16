import {SongPro} from "./index";

test('attribute parsing', () => {
  let song = SongPro.parse(`
@title=Bad Moon Rising
@artist=Creedence Clearwater Revival
@capo=1st Fret
@key=C# Minor
@tempo=120
@year=1975
@album=Foo Bar Baz
@tuning=Eb Standard
`);

  expect(song.attrs['title']).toEqual('Bad Moon Rising');
  expect(song.attrs['artist']).toEqual('Creedence Clearwater Revival');
  expect(song.attrs['capo']).toEqual('1st Fret');
  expect(song.attrs['key']).toEqual('C# Minor');
  expect(song.attrs['tempo']).toEqual('120');
  expect(song.attrs['year']).toEqual('1975');
  expect(song.attrs['album']).toEqual('Foo Bar Baz');
  expect(song.attrs['tuning']).toEqual('Eb Standard');
});

test('sections', () => {
  let song = SongPro.parse(`# Verse 1`)

  expect(song.sections.length).toBe(1);
  expect(song.sections[0].name).toEqual('Verse 1');
});

test('multiple sections', () => {
  let  song = SongPro.parse(`
# Verse 1
# Chorus
`);

  expect(song.sections.length).toBe(2);
  expect(song.sections[0].name).toEqual('Verse 1');
  expect(song.sections[1].name).toEqual('Chorus');
});

test('lyrics', () => {
  let song = SongPro.parse(`I don't see! a bad, moon a-rising. (a-rising)`);

  expect(song.sections.length).toBe(1);
  expect(song.sections[0].lines.length).toBe(1);
  expect(song.sections[0].lines[0].parts.length).toBe(1);
  expect(song.sections[0].lines[0].parts[0].lyric).toEqual("I don't see! a bad, moon a-rising. (a-rising)");
});

test('chords', () => {
  let song = SongPro.parse('[D] [D/F#] [C] [A7]');
  expect(song.sections.length).toBe(1);
  expect(song.sections[0].lines.length).toBe(1);
  expect(song.sections[0].lines[0].parts.length).toBe(4);
  expect(song.sections[0].lines[0].parts[0].chord).toEqual('D');
  expect(song.sections[0].lines[0].parts[0].lyric).toEqual('');
  expect(song.sections[0].lines[0].parts[1].chord).toEqual('D/F#');
  expect(song.sections[0].lines[0].parts[1].lyric).toEqual('');
  expect(song.sections[0].lines[0].parts[2].chord).toEqual('C');
  expect(song.sections[0].lines[0].parts[2].lyric).toEqual('');
  expect(song.sections[0].lines[0].parts[3].chord).toEqual('A7');
  expect(song.sections[0].lines[0].parts[3].lyric).toEqual('');
});

test('chord and lyrics', () => {
  let song = SongPro.parse("[G]Don't go 'round tonight");

  expect(song.sections.length).toEqual(1);
  expect(song.sections[0].lines.length).toEqual(1);
  expect(song.sections[0].lines[0].parts.length).toEqual(1);
  expect(song.sections[0].lines[0].parts[0].chord).toEqual('G');
  expect(song.sections[0].lines[0].parts[0].lyric).toEqual("Don't go 'round tonight");
});

test('lyrics before chords', () => {
  let song = SongPro.parse("It's [D]bound to take your life");

  expect(song.sections.length).toEqual(1);
  expect(song.sections[0].lines.length).toEqual(1);
  expect(song.sections[0].lines[0].parts.length).toEqual(2);
  expect(song.sections[0].lines[0].parts[0].chord).toEqual('');
  expect(song.sections[0].lines[0].parts[0].lyric).toEqual("It's");
  expect(song.sections[0].lines[0].parts[1].chord).toEqual('D');
  expect(song.sections[0].lines[0].parts[1].lyric).toEqual('bound to take your life');
});

# SongPro for Javascript & TypeScript

[SongPro](https://songpro.org) is a text format for transcribing songs.

This project is a Javascript package that converts the song into a Song data model which can then be converted into various output formats such as text or HTML.

## Installation

```bash
npm install songpro --save
```

## Usage
Given the file `escape-capsule.sng` with the following contents:

```
@title=Escape Capsule
@artist=Brian Kelly

# Verse 1

Climb a-[D]board [A]
I've been [Bm]waiting for you [F#m]
Climb a-[G]board [D]
You'll be [Asus4]safe in [A7]here

# Chorus 1

[G] I'm a [D]rocket [F#]made for your pro-[Bm]tection
You're [G]safe with me, un-[A]til you leave
```

Just import `SongProParser` into your project and pass it the contents of a SongPro file as a string like this:

**For JavaScript Projects**
```javascript
const fs = require('fs');
const { SongProParser } = require('songpro');

fs.readFile('escape-capsule.sng', function(err, contents) {
    let song = SongProParser(contents);

    console.log(song.title);
    console.log(song.artist);
    console.log(song.sections[0].title);
});
```

**For TypeScript Projects**
```typescript
import { readFile } from 'fs';
import { SongProParser, ISongProSong } from 'songpro';

readFile('escape-capsule.sng', function(err, contents) {
    let song: ISongProSong = SongProParser(contents);

    console.log(song.title);
    console.log(song.artist);
    console.log(song.sections[0].title);
});
```

The following `ISongProSong` object is returned:
```javascript
{
  attrs: { title: 'Escape Capsule' },
  custom: { },
  sections: [
    {
      name: "Verse 1",
      lines: [
        {
          parts: [
            { chord: "", lyric: "Climb a-" },
            { chord: "D", lyric: "board" },
            { chord: "A", lyric: "" },
          ]
        },
        {
          parts: [
            { chord: "", lyric: "I've been" },
            { chord: "Bm", lyric: "waiting for you" },
            { chord: "F#m", lyric: "" },
          ]
        },
        {
          parts: [
            { chord: "", lyric: "Climb a-" },
            { chord: "G", lyric: "board" },
            { chord: "D", lyric: "" },
          ]
        },
        {
          parts: [
            { chord: "", lyric: "You'll be" },
            { chord: "Asus4", lyric: "safe in" },
            { chord: "A7", lyric: "here" },
          ]
        }
      ]
    },
    {
      name: "Chorus 1",
      lines: [
        {
          parts: [
            { chord: "G", lyric: "I'm a" },
            { chord: "D", lyric: "rocket" },
            { chord: "F#", lyric: "made for your pro-" },
            { chord: "Bm", lyric: "tection" },
          ]
        },
        {
          parts: [
            { chord: "", lyric: "You're" },
            { chord: "G", lyric: "safe with me, un-" },
            { chord: "A", lyric: "til you leave" },
          ]
        }
      ]
    }
  ]
}
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/SongProOrg/songpro-javascript

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

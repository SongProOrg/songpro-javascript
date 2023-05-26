# SongPro for Javascript

[SongPro](https://songpro.org) is a text format for transcribing songs.

This project is a Javascript package that converts the song into a Song data model which can then be converted into various output formats such as text or HTML.

## Installation

```bash
$ npm install songpro
```

## Usage

Given the file 'escape-capsule.md' with the following contents:

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

You can parse the contents of the file to create a `Song` object:

```javascript
const fs = require('fs');
const { SongPro } = require('songpro');

fs.readFile('escape-capsule.md', function(err, contents) {
    let song = SongPro.parse(contents);

    console.log(song.title);
    console.log(song.artist);
    console.log(song.sections[0].title);
});
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/SongProOrg/songpro-javascript

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

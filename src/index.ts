import { Parser } from "./parser";
import { ISongProSong } from "./parser.model";

export * from "./parser.model";

export class SongPro {
  public static parse(text: string): ISongProSong {
    const parser = new Parser();
    return parser.parse(text);
  }
}

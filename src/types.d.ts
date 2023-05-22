import { Line } from "./Line";

export type IMatchArray = (string | undefined)[];

export interface ISong {
  attrs: {
    [key: string]: string | undefined;
    title?: string;
    artist?: string;
    capo?: string;
    key?: string;
    tempo?: string;
    year?: string;
    album?: string;
    tuning?: string;
  };
  sections: ISection[];
  custom: Record<string, string>;
}

export interface ISection {
  lines: Line[];
  name: string;
}

export interface IMeasure {
  chords: IMatchArray;
}

export interface IPart {
  chord?: string;
  lyric?: string;
}

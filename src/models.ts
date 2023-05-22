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
  chords: (string | undefined)[];
}

export interface IPart {
  chord?: string;
  lyric?: string;
}

export class Line {
  parts: IPart[] = [];
  measures?: IMeasure[];
  tablature?: string;
  comment?: string;

  hasTablature(): boolean {
    return this.tablature !== undefined;
  }

  hasMeasures(): boolean {
    return this.measures !== undefined;
  }

  hasComment(): boolean {
    return this.comment !== undefined;
  }
}

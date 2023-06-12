export interface ISongProSong {
  attrs: ISongProAttrs;
  sections: ISongProSection[];
  custom: Record<string, string>;
}

export interface ISongProAttrs {
  [key: string]: string | undefined;
  title?: string;
  artist?: string;
  capo?: string;
  key?: string;
  tempo?: string;
  year?: string;
  album?: string;
  tuning?: string;
}

export interface ISongProSection {
  lines: ISongProLine[];
  name: string;
}

export interface ISongProLine {
  parts: ISongProPart[];
  measures?: ISongProMeasure[];
  tablature?: string;
  comment?: string;

  hasTablature: () => this is { tablature: string };
  hasMeasures: () => this is { measures: ISongProMeasure[] };
  hasComment: () => this is { comment: string };
}

export interface ISongProMeasure {
  chords: (string | undefined)[];
}

export interface ISongProPart {
  chord: string;
  lyric: string;
}

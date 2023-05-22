import { ISection } from "./Section";

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
  custom: { [key: string]: string };
}

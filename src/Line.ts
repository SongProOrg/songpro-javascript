import { IMeasure, IPart } from "./types";

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

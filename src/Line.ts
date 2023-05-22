import { IMeasure, IPart } from "./types";

export class Line {
  parts: IPart[] = [];
  measures: IMeasure[] | undefined;
  tablature: string | undefined;
  comment: string | undefined;

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

import { IMeasure, IPart } from "./types";

export class Line {
  public parts: IPart[] = [];
  public measures: IMeasure[] | undefined;
  public tablature: string | undefined;
  public comment: string | undefined;

  public hasTablature(): boolean {
    return this.tablature != undefined;
  }

  public hasMeasures(): boolean {
    return this.measures != undefined;
  }

  public hasComment(): boolean {
    return this.comment != undefined;
  }
}

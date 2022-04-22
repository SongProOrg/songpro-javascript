export class Line {
  constructor() {
    this.parts = [];
    this.measures = null;
    this.tablature = null;
    this.comment = null;
  }

  hasTablature() {
    return this.tablature != null;
  }

  hasMeasures() {
    return this.measures != null;
  }

  hasComment() {
    return this.comment != null;
  }
}

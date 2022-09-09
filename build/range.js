export const IsWithIn = (range) => (target) => target.start >= range.start && target.end <= range.end;
export const Overlaps = (range) => (target) => (target.start < range.end && target.end > range.start) ||
    (range.start < target.end && range.end > target.start);
export const Includes = (range) => (target) => target.start <= range.start && target.end >= range.end;
export class RangeBase {
    get range() {
        return new Range(this.start, this.end);
    }
    IsWithIn(range) {
        return IsWithIn(range)(this);
    }
    Overlaps(range) {
        return Overlaps(range)(this);
    }
    Includes(range) {
        return Includes(range)(this);
    }
}
export class Range extends RangeBase {
    start;
    end;
    constructor(start, end) {
        super();
        [this.start, this.end] = [+start, +end];
    }
    Copy() {
        return new Range(this.start, this.end);
    }
}
export default Range;

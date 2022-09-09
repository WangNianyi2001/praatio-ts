export default class Range {
    WithIn(range) {
        return this.start >= range.start && this.end <= range.end;
    }
    Overlaps(range) {
        return this.start <= range.end || this.end >= range.start;
    }
    Includes(range) {
        return this.start <= range.start && this.end >= range.end;
    }
}

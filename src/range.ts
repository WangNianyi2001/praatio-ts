export default abstract class Range<T extends Range<T>> {
	abstract get start(): number;
	abstract get end(): number;

	abstract Copy(): T;

	WithIn(range: Range<any>): boolean {
		return this.start >= range.start && this.end <= range.end;
	}
	Overlaps(range: Range<any>): boolean {
		return this.start <= range.end || this.end >= range.start
	}
	Includes(range: Range<any>): boolean {
		return this.start <= range.start && this.end >= range.end
	}
}
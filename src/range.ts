export interface IRange<Impl extends RangeBase<Impl>> {
	start: number;
	end: number;

	get range(): Range;
	Copy(): Impl;

	IsWithIn(range: IRange<any>): boolean;
	Overlaps(range: IRange<any>): boolean;
	Includes(range: IRange<any>): boolean;
}

export const IsWithIn = (range: IRange<any>) => (target: IRange<any>) =>
	target.start >= range.start && target.end <= range.end;

export const Overlaps = (range: IRange<any>) => (target: IRange<any>) =>
	(target.start < range.end && target.end > range.start) ||
	(range.start < target.end && range.end > target.start);

export const Includes = (range: IRange<any>) => (target: IRange<any>) =>
	target.start <= range.start && target.end >= range.end;

export abstract class RangeBase<Impl extends RangeBase<Impl>> implements IRange<Impl> {
	abstract get start(): number;
	abstract set start(value: number);
	abstract get end(): number;
	abstract set end(value: number);

	get range(): Range {
		return new Range(this.start, this.end);
	}
	abstract Copy(): Impl;

	IsWithIn(range: IRange<any>): boolean {
		return IsWithIn(range)(this);
	}
	Overlaps(range: IRange<any>): boolean {
		return Overlaps(range)(this);
	}
	Includes(range: IRange<any>): boolean {
		return Includes(range)(this);
	}
}

export class Range extends RangeBase<Range> {
	start: number;
	end: number;

	constructor(start: number, end: number) {
		super();
		[this.start, this.end] = [+start, +end];
	}

	override Copy(): Range {
		return new Range(this.start, this.end);
	}
}

export default Range;
import { RangeBase } from '../range.js';
import Tier from '../tier.js';

export class Interval extends RangeBase<Interval> {
	label: string;
	start: number;
	end: number;

	constructor(label: string, start: number, end: number) {
		super();
		this.label = label;
		this.start = start;
		this.end = end;
	}
	override Copy(): Interval {
		return new Interval(this.label, this.start, this.end);
	}
}

export default class IntervalTier extends Tier<Interval> {
	get type() { return 'IntervalTier'; }

	override Copy(): IntervalTier {
		const copy = new IntervalTier(this.name, this.Copy());
		return copy;
	}
}

export { IntervalTier };

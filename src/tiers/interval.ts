import Range from '../range.js';
import Tier from '../tier.js';

export class Interval extends Range<Interval> {
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

export default class IntervalTier extends Tier<Interval, IntervalTier> {
	get intervals() { return this.denotations; }

	constructor(name: string, intervals?: Iterable<Interval>) {
		super(name, intervals);
	}
	override Copy(): IntervalTier {
		const copy = new IntervalTier(this.name, this.intervals.Copy());
		return copy;
	}
}

export { IntervalTier };
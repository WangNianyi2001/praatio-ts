import { RangeBase } from '../range.js';
import Tier from '../tier.js';

export class Point extends RangeBase<Point> {
	label: string;
	time: number;

	override get start() { return this.time; }
	override set start(value: number) { this.time = +value; }
	override get end() { return this.time; }
	override set end(value: number) { this.time = +value; }

	constructor(label: string, time: number) {
		super();
		this.label = label;
		this.time = time;
	}
	override Copy(): Point {
		return new Point(this.label, this.time);
	}
}

export default class PointTier extends Tier<Point> {
	get points() { return this.ranges; }
	get type() { return 'PointTier'; }

	override Copy(): PointTier {
		const copy = new PointTier(this.name, this.points.Copy());
		return copy;
	}
}

export { PointTier };
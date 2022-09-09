import Range from '../range.js';
import Tier from '../tier.js';

export class Point extends Range<Point> {
	label: string;
	time: number;

	override get start() { return this.time; }
	set start(value: number) { this.time = value; }
	override get end() { return this.time; }
	set end(value: number) { this.time = value; }

	constructor(label: string, time: number) {
		super();
		this.label = label;
		this.time = time;
	}
	override Copy(): Point {
		return new Point(this.label, this.time);
	}
}

export default class PointTier extends Tier<Point, PointTier> {
	get points() { return this.denotations; }

	constructor(name: string, points?: Iterable<Point>) {
		super(name, points);
	}
	override Copy(): PointTier {
		const copy = new PointTier(this.name, this.points.Copy());
		return copy;
	}
}

export { PointTier };
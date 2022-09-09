import { RangeBase } from '../range.js';
import Tier from '../tier.js';
export class Point extends RangeBase {
    label;
    time;
    get start() { return this.time; }
    set start(value) { this.time = +value; }
    get end() { return this.time; }
    set end(value) { this.time = +value; }
    constructor(label, time) {
        super();
        this.label = label;
        this.time = time;
    }
    Copy() {
        return new Point(this.label, this.time);
    }
}
export default class PointTier extends Tier {
    get points() { return this.denotations; }
    Copy() {
        const copy = new PointTier(this.name, this.points.Copy());
        return copy;
    }
}
export { PointTier };

import { RangeBase } from '../range.js';
import Tier from '../tier.js';
export class Interval extends RangeBase {
    label;
    start;
    end;
    constructor(label, start, end) {
        super();
        this.label = label;
        this.start = start;
        this.end = end;
    }
    Copy() {
        return new Interval(this.label, this.start, this.end);
    }
}
export default class IntervalTier extends Tier {
    get type() { return 'IntervalTier'; }
    Copy() {
        const copy = new IntervalTier(this.name, this.Copy());
        return copy;
    }
}
export { IntervalTier };

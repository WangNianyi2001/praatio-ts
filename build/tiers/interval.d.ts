import Range from '../range.js';
import Tier from '../tier.js';
export declare class Interval extends Range<Interval> {
    label: string;
    start: number;
    end: number;
    constructor(label: string, start: number, end: number);
    Copy(): Interval;
}
export default class IntervalTier extends Tier<Interval, IntervalTier> {
    get intervals(): import("../track.js").default<Interval>;
    constructor(name: string, intervals?: Iterable<Interval>);
    Copy(): IntervalTier;
}
export { IntervalTier };

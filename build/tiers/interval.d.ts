import { RangeBase } from '../range.js';
import Tier from '../tier.js';
export declare class Interval extends RangeBase<Interval> {
    label: string;
    start: number;
    end: number;
    constructor(label: string, start: number, end: number);
    Copy(): Interval;
}
export default class IntervalTier extends Tier<Interval> {
    get intervals(): import("../track.js").default<Interval>;
    Copy(): IntervalTier;
}
export { IntervalTier };

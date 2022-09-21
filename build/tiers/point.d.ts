import { RangeBase } from '../range.js';
import Tier from '../tier.js';
export declare class Point extends RangeBase<Point> {
    label: string;
    time: number;
    get start(): number;
    set start(value: number);
    get end(): number;
    set end(value: number);
    constructor(label: string, time: number);
    Copy(): Point;
}
export default class PointTier extends Tier<Point> {
    get points(): import("../track.js").default<Point>;
    get type(): string;
    Copy(): PointTier;
}
export { PointTier };

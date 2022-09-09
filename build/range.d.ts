export interface IRange<Impl extends RangeBase<Impl>> {
    start: number;
    end: number;
    get range(): Range;
    Copy(): Impl;
    IsWithIn(range: IRange<any>): boolean;
    Overlaps(range: IRange<any>): boolean;
    Includes(range: IRange<any>): boolean;
}
export declare const IsWithIn: (range: IRange<any>) => (target: IRange<any>) => boolean;
export declare const Overlaps: (range: IRange<any>) => (target: IRange<any>) => boolean;
export declare const Includes: (range: IRange<any>) => (target: IRange<any>) => boolean;
export declare abstract class RangeBase<Impl extends RangeBase<Impl>> implements IRange<Impl> {
    abstract get start(): number;
    abstract set start(value: number);
    abstract get end(): number;
    abstract set end(value: number);
    get range(): Range;
    abstract Copy(): Impl;
    IsWithIn(range: IRange<any>): boolean;
    Overlaps(range: IRange<any>): boolean;
    Includes(range: IRange<any>): boolean;
}
export declare class Range extends RangeBase<Range> {
    start: number;
    end: number;
    constructor(start: number, end: number);
    Copy(): Range;
}
export default Range;

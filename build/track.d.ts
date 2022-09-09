import { IRange, RangeBase } from './range.js';
export default class Track<R extends RangeBase<any>> extends Array<R> {
    get empty(): boolean;
    get span(): number;
    constructor(array?: Iterable<R>);
    Copy(): Track<R>;
    slice(): Array<R>;
    IndexOf(denotation: R): number;
    At(time: number): R | null;
    AtIndex(index: number): R | null;
    Yield(predicate: (range: IRange<any>) => boolean): Generator<[number, R]>;
    ReverseYield(predicate: (range: IRange<any>) => boolean): Generator<[number, R]>;
    First(predicate: (range: IRange<any>) => boolean): R | null;
    Last(predicate: (range: IRange<any>) => boolean): R | null;
    Any(predicate: (range: IRange<any>) => boolean): boolean;
    Insert(range: R): number;
    Remove(range: R): number;
    Adjust(range: R, target: IRange<any>): boolean;
    AdjustAdjacent(left: R, right: R, time: number): boolean;
}

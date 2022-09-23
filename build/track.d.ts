import { IRange, RangeBase } from './range.js';
export default class Track<R extends RangeBase<any>> {
    ranges: R[];
    get empty(): boolean;
    get length(): number;
    [Symbol.iterator](): Iterator<R>;
    constructor(array?: Iterable<R>);
    Copy(): Track<R>;
    IndexOf(denotation: R): number;
    At(time: number): R | null;
    AtIndex(index: number): R | null;
    Yield(predicate: (range: R) => boolean): Generator<[number, R]>;
    ReverseYield(predicate: (range: R) => boolean): Generator<[number, R]>;
    First(predicate: (range: R) => boolean): R | null;
    Last(predicate: (range: R) => boolean): R | null;
    Any(predicate: (range: R) => boolean): boolean;
    Insert(range: R): number;
    Remove(range: R): number;
    Adjust(range: R, target: IRange<any>): boolean;
    AdjustAdjacent(left: R, right: R, time: number): boolean;
}

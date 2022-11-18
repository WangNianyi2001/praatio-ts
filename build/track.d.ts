import { IRange, RangeBase } from './range.js';
export default class Track<R extends RangeBase<any>> {
    readonly ranges: R[];
    get empty(): boolean;
    get length(): number;
    [Symbol.iterator](): Iterator<R>;
    constructor(array?: Iterable<R>);
    Copy(): Track<R>;
    /** Public interfaces */
    /** Sort ranges in track by start time. */
    Sort(): void;
    /**
     * Find the index of certain range in track.
     * @returns -1 if not found.
    */
    IndexOf(range: R): number;
    /**
     * Find range by time.
     * @returns The first range that is including the time.
     */
    AtTime(time: number): R | null;
    /** Get range by index. */
    AtIndex(index: number): R | null;
    /** Yield all ranges in order by predicate. */
    Yield(predicate: (range: R) => boolean): Generator<R>;
    /** Yield all ranges in reverse order by predicate. */
    ReverseYield(predicate: (range: R) => boolean): Generator<R>;
    /** Find the first range satisfying the predicate. */
    First(predicate: (range: R) => boolean): R | null;
    /** Find the last range satisfying the predicate. */
    Last(predicate: (range: R) => boolean): R | null;
    /** Check if there is any range satisfies the predicate. */
    Any(predicate: (range: R) => boolean): boolean;
    /**
     * Insert a range into track.
     * @returns Inserted index, -1 if failed.
     */
    Insert(range: R): number;
    /**
     * Removes a range from track.
     * @returns Original index of the removed range, -1 if failed.
     */
    Remove(range: R): number;
    /**
     * Adjust a range's position and length.
     * @param target Destination range.
     * @returns Successful or not.
     */
    Adjust(range: R, target: IRange<any>): boolean;
    /**
     * Adjust the boundary of two adjacent ranges.
     * @param time Destination time.
     */
    AdjustAdjacent(left: R, right: R, time: number): boolean;
}

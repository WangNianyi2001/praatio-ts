import { Range, IsWithIn, Overlaps } from './range.js';
export default class Track {
    //#region Core fields
    ranges = [];
    //#endregion
    //#region Properties
    get empty() {
        return !(this.ranges.length > 0);
    }
    get length() {
        let max = 0;
        for (const range of this)
            max = Math.max(range.end, max);
        return max;
    }
    [Symbol.iterator]() {
        return this.ranges.values();
    }
    //#endregion
    //#region Constructors
    constructor(array = []) {
        this.ranges.push(...array);
        this.Sort();
        for (let i = 1; i < this.ranges.length; ++i) {
            const [before, range] = [this.ranges[i - 1], this.ranges[i]];
            if (before.end > range.start)
                throw `Ranges overlap with each other`;
        }
    }
    Copy() {
        return new Track(this.ranges.map(range => range.Copy()));
    }
    //#endregion
    /** Public interfaces */
    //#region Auxiliary
    /** Sort ranges in track by start time. */
    Sort() {
        this.ranges.sort((a, b) => a.start - b.start);
    }
    //#endregion
    //#region Indexing
    /**
     * Find the index of certain range in track.
     * @returns -1 if not found.
    */
    IndexOf(range) {
        return this.ranges.indexOf(range);
    }
    /**
     * Find range by time.
     * @returns The first range that is including the time.
     */
    AtTime(time) {
        return this.First(range => range.Includes(new Range(time, time)));
    }
    /** Get range by index. */
    AtIndex(index) {
        if (index < 0 || index >= this.ranges.length)
            return null;
        return this.ranges[Math.floor(index)];
    }
    //#endregion
    //#region Traversing & yielding
    /** Yield all ranges in order by predicate. */
    *Yield(predicate) {
        for (const range of this.ranges)
            if (predicate(range))
                yield range;
    }
    /** Yield all ranges in reverse order by predicate. */
    *ReverseYield(predicate) {
        for (const range of this.ranges.slice().reverse())
            if (predicate(range))
                yield range;
    }
    //#endregion
    //#region Querying
    /** Find the first range satisfying the predicate. */
    First(predicate) {
        const it = this.Yield(predicate).next();
        return it.done ? null : it.value[1];
    }
    /** Find the last range satisfying the predicate. */
    Last(predicate) {
        const it = this.ReverseYield(predicate).next();
        return it.done ? null : it.value[1];
    }
    /** Check if there is any range satisfies the predicate. */
    Any(predicate) {
        return !this.Yield(predicate).next().done;
    }
    //#endregion
    //#region Range operations
    /**
     * Insert a range into track.
     * @returns Inserted index, -1 if failed.
     */
    Insert(range) {
        if (this.Any(Overlaps(new Range(range.start, range.end))))
            return -1;
        if (this.empty) {
            this.ranges.push(range);
            return 0;
        }
        const it = this.Yield(IsWithIn(new Range(range.end, this.length))).next();
        const index = (it.done ? this.ranges.length : it.value[0]) - 1;
        this.ranges.splice(index, 0, range);
        return index;
    }
    /**
     * Removes a range from track.
     * @returns Original index of the removed range, -1 if failed.
     */
    Remove(range) {
        const index = this.IndexOf(range);
        if (index === -1)
            return -1;
        this.ranges.splice(index, 1);
        return index;
    }
    /**
     * Adjust a range's position and length.
     * @param target Destination range.
     * @returns Successful or not.
     */
    Adjust(range, target) {
        if (this.Any(obj => obj !== range && obj.Overlaps(target)))
            return false;
        [range.start, range.end] = [target.start, target.end];
        this.Sort();
        return true;
    }
    /**
     * Adjust the boundary of two adjacent ranges.
     * @param time Destination time.
     */
    AdjustAdjacent(left, right, time) {
        const [leftRetract, rightRetract] = [
            left.end > time, right.start < time
        ];
        // First retract
        if ((leftRetract && !this.Adjust(left, new Range(left.start, time))) ||
            (rightRetract && !this.Adjust(left, new Range(time, right.end))))
            return false;
        // Then expand
        if ((!leftRetract && !this.Adjust(left, new Range(left.start, time))) ||
            (!rightRetract && !this.Adjust(right, new Range(time, right.end))))
            return false;
        return true;
    }
}

import { IRange, RangeBase, Range, IsWithIn, Overlaps } from './range.js';

export default class Track<R extends RangeBase<any>> {
	//#region Core fields
	readonly ranges: R[] = [];
	//#endregion

	//#region Properties
	get empty(): boolean {
		return !(this.ranges.length > 0);
	}
	get length(): number {
		let max = 0;
		for(const range of this)
			max = Math.max(range.end, max);
		return max;
	}
	[Symbol.iterator](): Iterator<R> {
		return this.ranges.values();
	}
	//#endregion

	//#region Constructors
	constructor(array: Iterable<R> = []) {
		this.ranges.push(...array);
		this.Sort();
		for(let i = 1; i < this.ranges.length; ++i) {
			const [before, range] = [this.ranges[i - 1], this.ranges[i]];
			if(before.end > range.start)
				throw `Ranges overlap with each other`;
		}
	}
	Copy(): Track<R> {
		return new Track<R>(this.ranges.map(range => range.Copy()));
	}
	//#endregion

	/** Public interfaces */

	//#region Auxiliary
	/** Sort ranges in track by start time. */
	Sort(): void {
		this.ranges.sort((a, b) => a.start - b.start);
	}
	//#endregion

	//#region Indexing
	/**
	 * Find the index of certain range in track.
	 * @returns -1 if not found.
	*/
	IndexOf(range: R): number {
		return this.ranges.indexOf(range);
	}
	/**
	 * Find range by time.
	 * @returns The first range that is including the time.
	 */
	AtTime(time: number): R | null {
		return this.First(range => range.Includes(new Range(time, time)));
	}
	/** Get range by index. */
	AtIndex(index: number): R | null {
		if(index < 0 || index >= this.ranges.length)
			return null;
		return this.ranges[Math.floor(index)];
	}
	//#endregion

	//#region Traversing & yielding
	/** Yield all ranges in order by predicate. */
	*Yield(predicate: (range: R) => boolean): Generator<R> {
		for(const range of this.ranges)
			if(predicate(range))
				yield range;
	}
	/** Yield all ranges in reverse order by predicate. */
	*ReverseYield(predicate: (range: R) => boolean): Generator<R> {
		for(const range of this.ranges.slice().reverse())
			if(predicate(range))
				yield range;
	}
	//#endregion

	//#region Querying
	/** Find the first range satisfying the predicate. */
	First(predicate: (range: R) => boolean): R | null {
		const it = this.Yield(predicate).next();
		return it.done ? null : it.value;
	}
	/** Find the last range satisfying the predicate. */
	Last(predicate: (range: R) => boolean): R | null {
		const it = this.ReverseYield(predicate).next();
		return it.done ? null : it.value;
	}
	/** Check if there is any range satisfies the predicate. */
	Any(predicate: (range: R) => boolean): boolean {
		return !this.Yield(predicate).next().done;
	}
	//#endregion

	//#region Range operations
	/**
	 * Insert a range into track.
	 * @returns Inserted index, -1 if failed.
	 */
	Insert(range: R): number {
		if(this.Any(Overlaps(new Range(range.start, range.end))))
			return -1;
		this.ranges.push(range);
		this.Sort();
		return this.IndexOf(range);
	}
	/**
	 * Removes a range from track.
	 * @returns Original index of the removed range, -1 if failed.
	 */
	Remove(range: R): number {
		const index = this.IndexOf(range);
		if(index === -1)
			return -1;
		this.ranges.splice(index, 1);
		return index;
	}
	/**
	 * Adjust a range's position and length.
	 * @param target Destination range.
	 * @returns Successful or not.
	 */
	Adjust(range: R, target: IRange<any>): boolean {
		if(this.Any(obj => obj !== range && obj.Overlaps(target)))
			return false;
		[range.start, range.end] = [target.start, target.end];
		this.Sort();
		return true;
	}
	/**
	 * Adjust the boundary of two adjacent ranges.
	 * @param time Destination time.
	 */
	AdjustAdjacent(left: R, right: R, time: number): boolean {
		const [leftRetract, rightRetract] = [
			left.end > time, right.start < time
		];
		// First retract
		if(
			(leftRetract && !this.Adjust(left, new Range(left.start, time))) ||
			(rightRetract && !this.Adjust(left, new Range(time, right.end)))
		) return false;
		// Then expand
		if(
			(!leftRetract && !this.Adjust(left, new Range(left.start, time))) ||
			(!rightRetract && !this.Adjust(right, new Range(time, right.end)))
		) return false;
		return true;
	}
	//#endregion
}

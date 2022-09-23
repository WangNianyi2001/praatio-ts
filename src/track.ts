import { IRange, RangeBase, Range, Includes, IsWithIn, Overlaps } from './range.js';

export default class Track<R extends RangeBase<any>> {
	ranges: R[] = [];

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

	constructor(array?: Iterable<R>) {
		if(array)
			this.ranges.push(...array);
	}
	Copy(): Track<R> {
		return new Track<R>(this.ranges.map(range => range.Copy()));
	}

	IndexOf(denotation: R): number {
		return this.ranges.indexOf(denotation);
	}
	At(time: number): R | null {
		return this.First(range => range.Includes(new Range(time, time)));
	}
	AtIndex(index: number): R | null {
		if(index < 0 || index >= this.ranges.length)
			return null;
		return this.ranges[Math.floor(index)];
	}

	*Yield(predicate: (range: R) => boolean): Generator<[number, R]> {
		for(let index = 0; index < this.ranges.length; ++index) {
			const range = this.ranges[index];
			if(predicate(range))
				yield [index, range];
		}
	}
	*ReverseYield(predicate: (range: R) => boolean): Generator<[number, R]> {
		for(let index = this.ranges.length - 1; index > 0; ) {
			--index;
			const range = this.ranges[index];
			if(predicate(range))
				yield [index, range];
		}
	}
	First(predicate: (range: R) => boolean): R | null {
		const it = this.Yield(predicate).next();
		return it.done ? null : it.value[1];
	}
	Last(predicate: (range: R) => boolean): R | null {
		const it = this.ReverseYield(predicate).next();
		return it.done ? null : it.value[1];
	}
	Any(predicate: (range: R) => boolean): boolean {
		return !this.Yield(predicate).next().done;
	}

	Insert(range: R): number {
		if(this.Any(Overlaps(new Range(range.start, range.end))))
			return -1;
		if(this.empty) {
			this.ranges.push(range);
			return 0;
		}
		const it = this.Yield(IsWithIn(new Range(range.end, this.length))).next();
		const index = (it.done ? this.ranges.length : it.value[0]) - 1;
		this.ranges.splice(index, 0, range);
		return index;
	}
	Remove(range: R): number {
		const index = this.IndexOf(range);
		if(index === -1)
			return -1;
		this.ranges.splice(index, 1);
		return index;
	}
	Adjust(range: R, target: IRange<any>): boolean {
		if(this.Any(obj => obj !== range && obj.Overlaps(target)))
			return false;
		[range.start, range.end] = [target.start, target.end];
		return true;
	}
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
}
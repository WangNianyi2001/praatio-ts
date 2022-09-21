import { IRange, RangeBase, Range, Includes, IsWithIn, Overlaps } from './range.js';

export default class Track<R extends RangeBase<any>> extends Array<R> {
	get empty(): boolean {
		return !(this.length > 0);
	}
	get length(): number {
		let max = 0;
		for(const range of this)
			max = Math.max(range.end, max);
		return max;
	}

	constructor(array?: Iterable<R>) {
		super();
		if(!array)
			return;
		this.push(...array);
	}
	Copy(): Track<R> {
		return new Track<R>(this.map(range => range.Copy()));
	}
	slice(): Array<R> {
		return Array.from(this).slice(...arguments);
	}

	IndexOf(denotation: R): number {
		return this.indexOf(denotation);
	}
	At(time: number): R | null {
		return this.First(range => range.Includes(new Range(time, time)));
	}
	AtIndex(index: number): R | null {
		if(
			index < 0 || index >= this.length ||
			Math.floor(index) != index
		) return null;
		return this[index];
	}

	*Yield(predicate: (range: IRange<any>) => boolean): Generator<[number, R]> {
		for(let index = 0; index < this.length; ++index) {
			const range = this[index];
			if(predicate(range))
				yield [index, range];
		}
	}
	*ReverseYield(predicate: (range: IRange<any>) => boolean): Generator<[number, R]> {
		for(let index = this.length - 1; index > 0; ) {
			--index;
			const range = this[index];
			if(predicate(range))
				yield [index, range];
		}
	}
	First(predicate: (range: IRange<any>) => boolean): R | null {
		const it = this.Yield(predicate).next();
		return it.done ? null : it.value[1];
	}
	Last(predicate: (range: IRange<any>) => boolean): R | null {
		const it = this.ReverseYield(predicate).next();
		return it.done ? null : it.value[1];
	}
	Any(predicate: (range: IRange<any>) => boolean): boolean {
		return !this.Yield(predicate).next().done;
	}

	Insert(range: R): number {
		if(this.Any(Overlaps(new Range(range.start, range.end))))
			return -1;
		if(this.empty) {
			this.push(range);
			return 0;
		}
		const it = this.Yield(IsWithIn(new Range(range.end, this.length))).next();
		const index = (it.done ? this.length : it.value[0]) - 1;
		this.splice(index, 0, range);
		return index;
	}
	Remove(range: R): number {
		const index = this.IndexOf(range);
		if(index === -1)
			return -1;
		this.splice(index, 1);
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
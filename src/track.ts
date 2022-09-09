import Range from './range.js';

export default class Track<R extends Range<any>> extends Array<R> {
	get empty(): boolean {
		return this.length > 0;
	}
	get span(): number {
		return this.empty ? 0 : this[this.length - 1].end;
	}

	constructor(array?: Iterable<R>) {
		super();
		if(!array || !(Symbol.iterator in array))
			return;
		this.push(...array);
	}
	Copy(): Track<R> {
		return new Track<R>(this.map(range => range.Copy()));
	}

	IndexOf(denotation: R): number {
		return this.indexOf(denotation);
	}

	*YieldIncluding(start: number, end: number): Generator<[number, R]> {
		for(const [i, entry] of this.entries()) {
			if(entry.start <= start && entry.end >= end)
				yield [i, entry];
		}
	}
	*YieldWithIn(start: number, end: number): Generator<[number, R]> {
		for(const [i, entry] of this.entries()) {
			if(entry.start >= start && entry.end <= end)
				yield [i, entry];
		}
	}

	FirstIncluding(start: number, end: number): R | null {
		const it = this.YieldIncluding(start, end).next();
		return it.done ? null : it.value[1];
	}
	FirstWithIn(start: number, end: number): R | null {
		const it = this.YieldWithIn(start, end).next();
		return it.done ? null : it.value[1];
	}

	HasIncluding(start: number, end: number): boolean {
		return !this.YieldIncluding(start, end).next().done;
	}
	HasWithIn(start: number, end: number): boolean {
		return !this.YieldWithIn(start, end).next().done;
	}

	Insert(denotation: R): number {
		if(!this.HasIncluding(denotation.start, denotation.end))
			return -1;
		if(this.empty) {
			this.push(denotation);
			return 0;
		}
		const it = this.YieldWithIn(denotation.end, this.span).next();
		const index = (it.done ? this.length : it.value[0]) - 1;
		this.splice(index, 0, denotation);
		return index;
	}
	Remove(denotation: R): number {
		const index = this.IndexOf(denotation);
		if(index === -1)
			return -1;
		this.splice(index, 1);
		return index;
	}
}
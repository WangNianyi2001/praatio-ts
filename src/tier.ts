import { IRange } from './range.js';
import Track from './track.js';
import TextGrid from './textgrid.js';

export default abstract class Tier<Denotation extends IRange<any>> {
	name: string;
	ranges = new Track<Denotation>();
	textgrid: TextGrid | null;
	abstract get type(): string;

	get span() {
		return this.textgrid ? this.textgrid.length : Infinity;
	}

	constructor(name: string, denotations?: Iterable<Denotation>) {
		this.name = name;
		this.ranges = new Track<Denotation>(denotations);
	}
	abstract Copy(): Tier<Denotation>;
}
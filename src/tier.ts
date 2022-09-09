import { IRange } from './range.js';
import Track from './track.js';
import TextGrid from './textgrid.js';

export default abstract class Tier<Denotation extends IRange<any>> {
	name: string;
	denotations = new Track<Denotation>();
	textgrid: TextGrid | null;

	get span() {
		return this.textgrid ? this.textgrid.span : Infinity;
	}

	constructor(name: string, denotations?: Iterable<Denotation>) {
		this.name = name;
		this.denotations = new Track<Denotation>(denotations);
	}
	abstract Copy(): Tier<Denotation>;
}
import Range from './range.js';
import Track from './track.js';
import TextGrid from './textgrid.js';

export default abstract class Tier<
	Denotation extends Range<any>,
	Impl extends Tier<Denotation, Impl>
> extends Range<Impl> {
	name: string;
	denotations = new Track<Denotation>();
	textgrid: TextGrid | null;

	override get start() {
		return 0;
	}
	override get end() {
		return this.textgrid ? this.textgrid.end : Infinity;
	}

	constructor(name: string, denotations?: Iterable<Denotation>) {
		super();
		this.name = name;
		this.denotations = new Track<Denotation>(denotations);
	}
	abstract Copy(): Impl;
}
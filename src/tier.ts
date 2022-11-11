import { IRange } from './range.js';
import Track from './track.js';
import TextGrid from './textgrid.js';

export default abstract class Tier<Range extends IRange<any>> extends Track<Range> {
	name: string;
	textgrid: TextGrid | null;
	abstract get type(): string;

	constructor(name: string, ranges?: Iterable<Range>) {
		super(ranges);
		this.name = name;
	}
	abstract Copy(): Tier<Range>;
}

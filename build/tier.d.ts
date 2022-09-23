import { IRange } from './range.js';
import Track from './track.js';
import TextGrid from './textgrid.js';
export default abstract class Tier<Denotation extends IRange<any>> {
    name: string;
    ranges: Track<Denotation>;
    textgrid: TextGrid | null;
    abstract get type(): string;
    get length(): number;
    constructor(name: string, denotations?: Iterable<Denotation>);
    abstract Copy(): Tier<Denotation>;
}

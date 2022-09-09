import Range from './range.js';
import Track from './track.js';
import TextGrid from './textgrid.js';
export default abstract class Tier<Denotation extends Range<any>, Impl extends Tier<Denotation, Impl>> extends Range<Impl> {
    name: string;
    denotations: Track<Denotation>;
    textgrid: TextGrid | null;
    get start(): number;
    get end(): number;
    constructor(name: string, denotations?: Iterable<Denotation>);
    abstract Copy(): Impl;
}

import { IRange } from './range.js';
import Track from './track.js';
import TextGrid from './textgrid.js';
export default abstract class Tier<Range extends IRange<any>> {
    name: string;
    ranges: Track<Range>;
    textgrid: TextGrid | null;
    abstract get type(): string;
    get length(): number;
    constructor(name: string, ranges?: Iterable<Range>);
    abstract Copy(): Tier<Range>;
}

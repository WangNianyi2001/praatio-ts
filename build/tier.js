import Range from './range.js';
import Track from './track.js';
export default class Tier extends Range {
    name;
    denotations = new Track();
    textgrid;
    get start() {
        return 0;
    }
    get end() {
        return this.textgrid ? this.textgrid.end : Infinity;
    }
    constructor(name, denotations) {
        super();
        this.name = name;
        this.denotations = new Track(denotations);
    }
}

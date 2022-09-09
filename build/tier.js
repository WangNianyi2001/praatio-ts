import Track from './track.js';
export default class Tier {
    name;
    denotations = new Track();
    textgrid;
    get span() {
        return this.textgrid ? this.textgrid.span : Infinity;
    }
    constructor(name, denotations) {
        this.name = name;
        this.denotations = new Track(denotations);
    }
}

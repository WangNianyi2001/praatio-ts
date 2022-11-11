import Track from './track.js';
export default class Tier {
    name;
    ranges = new Track();
    textgrid;
    get length() {
        return this.textgrid ? this.textgrid.length : Infinity;
    }
    constructor(name, ranges) {
        this.name = name;
        this.ranges = new Track(ranges);
    }
}

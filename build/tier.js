import Track from './track.js';
export default class Tier extends Track {
    name;
    textgrid;
    constructor(name, ranges) {
        super(ranges);
        this.name = name;
    }
}

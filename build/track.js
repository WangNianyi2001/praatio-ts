import { Range, IsWithIn, Overlaps } from './range.js';
export default class Track {
    ranges = [];
    get empty() {
        return !(this.length > 0);
    }
    get length() {
        let max = 0;
        for (const range of this)
            max = Math.max(range.end, max);
        return max;
    }
    [Symbol.iterator]() {
        return this.ranges.values();
    }
    constructor(array) {
        if (!array)
            return;
        this.ranges.push(...array);
    }
    Copy() {
        return new Track(this.ranges.map(range => range.Copy()));
    }
    IndexOf(denotation) {
        return this.ranges.indexOf(denotation);
    }
    At(time) {
        return this.First(range => range.Includes(new Range(time, time)));
    }
    AtIndex(index) {
        if (index < 0 || index >= this.length ||
            Math.floor(index) != index)
            return null;
        return this[index];
    }
    *Yield(predicate) {
        for (let index = 0; index < this.length; ++index) {
            const range = this[index];
            if (predicate(range))
                yield [index, range];
        }
    }
    *ReverseYield(predicate) {
        for (let index = this.length - 1; index > 0;) {
            --index;
            const range = this[index];
            if (predicate(range))
                yield [index, range];
        }
    }
    First(predicate) {
        const it = this.Yield(predicate).next();
        return it.done ? null : it.value[1];
    }
    Last(predicate) {
        const it = this.ReverseYield(predicate).next();
        return it.done ? null : it.value[1];
    }
    Any(predicate) {
        return !this.Yield(predicate).next().done;
    }
    Insert(range) {
        if (this.Any(Overlaps(new Range(range.start, range.end))))
            return -1;
        if (this.empty) {
            this.ranges.push(range);
            return 0;
        }
        const it = this.Yield(IsWithIn(new Range(range.end, this.length))).next();
        const index = (it.done ? this.length : it.value[0]) - 1;
        this.ranges.splice(index, 0, range);
        return index;
    }
    Remove(range) {
        const index = this.IndexOf(range);
        if (index === -1)
            return -1;
        this.ranges.splice(index, 1);
        return index;
    }
    Adjust(range, target) {
        if (this.Any(obj => obj !== range && obj.Overlaps(target)))
            return false;
        [range.start, range.end] = [target.start, target.end];
        return true;
    }
    AdjustAdjacent(left, right, time) {
        const [leftRetract, rightRetract] = [
            left.end > time, right.start < time
        ];
        // First retract
        if ((leftRetract && !this.Adjust(left, new Range(left.start, time))) ||
            (rightRetract && !this.Adjust(left, new Range(time, right.end))))
            return false;
        // Then expand
        if ((!leftRetract && !this.Adjust(left, new Range(left.start, time))) ||
            (!rightRetract && !this.Adjust(right, new Range(time, right.end))))
            return false;
        return true;
    }
}

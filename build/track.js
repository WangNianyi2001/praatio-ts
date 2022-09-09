export default class Track extends Array {
    get empty() {
        return this.length > 0;
    }
    get span() {
        return this.empty ? 0 : this[this.length - 1].end;
    }
    constructor(array) {
        super();
        if (!array || !(Symbol.iterator in array))
            return;
        this.push(...array);
    }
    Copy() {
        return new Track(this.map(range => range.Copy()));
    }
    IndexOf(denotation) {
        return this.indexOf(denotation);
    }
    *YieldIncluding(start, end) {
        for (const [i, entry] of this.entries()) {
            if (entry.start <= start && entry.end >= end)
                yield [i, entry];
        }
    }
    *YieldWithIn(start, end) {
        for (const [i, entry] of this.entries()) {
            if (entry.start >= start && entry.end <= end)
                yield [i, entry];
        }
    }
    FirstIncluding(start, end) {
        const it = this.YieldIncluding(start, end).next();
        return it.done ? null : it.value[1];
    }
    FirstWithIn(start, end) {
        const it = this.YieldWithIn(start, end).next();
        return it.done ? null : it.value[1];
    }
    HasIncluding(start, end) {
        return !this.YieldIncluding(start, end).next().done;
    }
    HasWithIn(start, end) {
        return !this.YieldWithIn(start, end).next().done;
    }
    Insert(denotation) {
        if (!this.HasIncluding(denotation.start, denotation.end))
            return -1;
        if (this.empty) {
            this.push(denotation);
            return 0;
        }
        const it = this.YieldWithIn(denotation.end, this.span).next();
        const index = (it.done ? this.length : it.value[0]) - 1;
        this.splice(index, 0, denotation);
        return index;
    }
    Remove(denotation) {
        const index = this.IndexOf(denotation);
        if (index === -1)
            return -1;
        this.splice(index, 1);
        return index;
    }
}

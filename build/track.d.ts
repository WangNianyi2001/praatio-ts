import Range from './range.js';
export default class Track<R extends Range<any>> extends Array<R> {
    get empty(): boolean;
    get span(): number;
    constructor(array?: Iterable<R>);
    Copy(): Track<R>;
    IndexOf(denotation: R): number;
    YieldIncluding(start: number, end: number): Generator<[number, R]>;
    YieldWithIn(start: number, end: number): Generator<[number, R]>;
    FirstIncluding(start: number, end: number): R | null;
    FirstWithIn(start: number, end: number): R | null;
    HasIncluding(start: number, end: number): boolean;
    HasWithIn(start: number, end: number): boolean;
    Insert(denotation: R): number;
    Remove(denotation: R): number;
}

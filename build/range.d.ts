export default abstract class Range<T extends Range<T>> {
    abstract get start(): number;
    abstract get end(): number;
    abstract Copy(): T;
    WithIn(range: Range<any>): boolean;
    Overlaps(range: Range<any>): boolean;
    Includes(range: Range<any>): boolean;
}

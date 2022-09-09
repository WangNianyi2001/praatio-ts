export declare class OvershootModificationException extends Error {
    tierName: string;
    oldEntry: any;
    newEntry: any;
    min: number;
    max: number;
    constructor(tierName: any, oldEntry: any, newEntry: any, min: any, max: any, ...args: any[]);
}
export declare class IncorrectArgumentException extends Error {
    value: any;
    targetValueList: any[];
    constructor(value: any, targetValueList: any, ...args: any[]);
}

declare type Entry = [number, number, string];
declare abstract class Tier {
    name: string;
    entryList: Entry[];
    minTimestamp: number;
    maxTimestamp: number;
    labelIndex: number;
    constructor(name: string, entryList: Entry[], minT: number, maxT: number);
    deleteEntry(entry: Entry): void;
    sort(): void;
}
declare class PointTier extends Tier {
    constructor(name: string, entryList: any[], minT: number, maxT: number);
    insertEntry(entry: Entry, warnFlag?: boolean, collisionCode?: string): void;
}
/**
 * Class representing an IntervalTier.
 * @augments Tier
 */
declare class IntervalTier extends Tier {
    /**
     * @constructor
     * @param {string} name
     * @param {Array} entryList - each entry is of the form [start time, end time, label]
     * @param {number} [minT=null] - the smallest time; if null use 0
     * @param {number} [maxT=null] - the maximum length of the tier; if null use the last timestamp found in the entryList
     */
    constructor(name: any, entryList: any, minT?: any, maxT?: any);
    /**
     * Insert an entry into the tier
     * @param {Array} entry - of the form [start time, end time, label]
     * @param {boolean} [warnFlag=true] - if the entry collides with an existing entry, warn the user?
     * @param {string} [collisionCode=null] - the action to take if there is a collision
     */
    insertEntry(entry: Entry, warnFlag?: boolean, collisionCode?: string): void;
}
/**
 * Class representing a Textgrid.<br /><br />
 * A Textgrid is a container for annotations of an audio
 * file.  Annotations can be split into multiple tiers that
 * might represent different things (different speakers or
 * categories of events, etc). <br /><br />
 *
 * A Textgrid allows one to compute operations that affect
 * all of the contained tiers.
 */
declare class TextGrid {
    tierNameList: string[];
    tierDict: any;
    minTimestamp: number;
    maxTimestamp: number;
    constructor();
    /**
     * Adds a tier to the textgrid.  Added to the end, unless an index is specified.
     * @param {Tier} tier
     * @param {number} [tierIndex=null] - The index to insert at.  If null, add it to the end.
     */
    addTier(tier: any, tierIndex?: any): void;
    /**
     * Makes all min and max timestamps within a textgrid the same
     * @ignore
     */
    _homogonizeMinMaxTimestamps(): void;
    /**
     * Renames one tier.  The new name must not exist in the textgrid already.
     * @param {string} oldName
     * @param {string} newName
     */
    renameTier(oldName: any, newName: any): void;
    /**
     * Removes the given tier from this textgrid.
     * @param {string} name
     */
    removeTier(name: any): void;
    /**
     * Replace the tier with the given name with a new tier
     * @param {string} name
     * @param {Tier} newTier
     */
    replaceTier(name: any, newTier: any): void;
}
/**
 * Returns true if the two textgrids are the same, false otherwise
 * @param {TextGrid} tg1
 * @param {TextGrid} tg2
 * @return {boolean}
 */
declare function compareTextgrids(tg1: any, tg2: any): boolean;
/**
 * Returns true if the two tiers are the same, false otherwise
 * @param {Tier} tier1
 * @param {Tier} tier2
 * @return {boolean}
 */
declare function compareTiers(tier1: any, tier2: any): boolean;
/**
 * Returns true if the two entries are the same, false otherwise
 * @param {Array} entryA
 * @param {Array} entryB
 * @return {boolean}
 */
declare function compareEntries(entryA: any, entryB: any): any;
declare function comparePoints(pointA: any, pointB: any): boolean;
declare function compareIntervals(intervalA: any, intervalB: any): boolean;
/**
 * Returns a deep copy of a textgrid.
 * @param {TextGrid} tg
 * @return {TextGrid}
 */
declare function copyTextgrid(tg: any): TextGrid;
/**
 * Returns a deep copy of a tier
 * @param {Tier} tier
 * @param {Object} - an object containing optional values to replace those in the copy.  If the four paramaters name, entryList, minTimestamp, and maxTimestamp are null or not specified, those in the tier will be used (default behaviour).
 * @return {Tier}
 */
declare function copyTier(tier: any, { name, entryList, minTimestamp, maxTimestamp }?: {
    name?: any;
    entryList?: any;
    minTimestamp?: any;
    maxTimestamp?: any;
}): any;
/**
 * Get the values that occur at points in the point tier.
 * @param {PointTier} pointTier
 * @param {Array} dataTupleList - should be ordered in time;
 *  must be of the form [(t1, v1a, v1b, ..), (t2, v2a, v2b, ..), ..]
 * @return {Array}
 */
declare function getValuesAtPoints(pointTier: any, dataTupleList: any): any[];
/**
 * Returns data from dataTupleList contained in labeled intervals
 * @params {IntervalTier} intervalTier
 * @params {Array} dataTupleList  - should be of the form: [(time1, value1a, value1b,..), (time2, value2a, value2b..), ..]
 * @return {Array}
 */
declare function getValuesInIntervals(intervalTier: any, dataTupleList: any): any[];
/**
 * Given an interval, returns entries in an interval tier that are in or (for intervals) that partially overlap with it
 * @params {TextgridTier} tier
 * @params {number} startTime
 * @params {number} endTime
 * @return {Array} entryList
 */
declare function getEntriesInInterval(tier: any, startTime: any, endTime: any): any;
/**
 * Returns the regions of the textgrid without labels
 * @params {IntervalTier} intervalTier
 * @return {Array} invertedEntryList - where each entry looks like [start time, end time, '']
 */
declare function getNonEntriesFromIntervalTier(intervalTier: any): any[];
/**
 * Returns the indexes of the entries that match the search label
 * @params {TextgridTier} tier
 * @params {string} searchLabel
 * @params {string} [mode=null] If null, look for exact matches; if 're', match using regular expressions; if 'substr' look for substring matches
 * @return {Array}
 */
declare function findLabelInTier(tier: any, searchLabel: any, mode?: any): any[];
export { TextGrid, Tier, IntervalTier, PointTier, compareTextgrids, compareTiers, compareEntries, comparePoints, compareIntervals, copyTextgrid, copyTier, getValuesAtPoints, getValuesInIntervals, getEntriesInInterval, getNonEntriesFromIntervalTier, findLabelInTier };

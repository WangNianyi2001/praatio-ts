/** @module utils */
/** Test if two intervals overlap */
declare function doIntervalsOverlap(interval1: any, interval2: any): boolean;
/** Test for near equivalence in float values.  From here http://realtimecollisiondetection.net/blog/?p=89 */
declare function isClose(a: any, b: any, relTol?: number, abs_tol?: number): boolean;
/** Pass to sort, when sorting a list of entries to sort entries by start time */
declare function sortCompareEntriesByTime(x: any, y: any): number;
/**
 * Builds a balanced binary tree from an entry list for quickly finding things at certain times
 * @param {Array} entryList - can consist of intervals or points in time
 * @return {Object} The root node of the tree. Each node has a left and right branch;
 *  nodes in the left branch occur in time before the start time in parent nodes
 *  nodes in the right branch occur in time after the stop time in parent nodes
 */
declare function entryListToTree(entryList: any): any;
/**
 * Returns the interval in an IntervalTier that contains the given time
 * @param {number} time
 * @param {Object} rootNode - a tree built from entryListToTree()
 * @return {Array} The matched interval.  Of the form [start, stop, label].
 */
declare function findIntervalAtTime(time: any, rootNode: any): any;
/**
 * Returns the point in a PointTier that occurs at a specific time
 * @param {number} time
 * @param {Object} rootNode - a tree built from entryListToTree()
 * @param {boolean} [findClosest=false] - If true, return the entryList point that is closest to this time, even if its not an exact match.
 *  If false, only return exact matches.
 * @return {Array} The matched point.  Of the form [time, label].
 */
declare function findPointAtTime(time: any, rootNode: any, findClosest?: boolean): any;
export { doIntervalsOverlap, isClose, sortCompareEntriesByTime, entryListToTree, findIntervalAtTime, findPointAtTime };

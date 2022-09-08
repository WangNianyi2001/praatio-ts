"use strict";
/** @module utils */
exports.__esModule = true;
exports.findPointAtTime = exports.findIntervalAtTime = exports.entryListToTree = exports.sortCompareEntriesByTime = exports.isClose = exports.doIntervalsOverlap = void 0;
/** Test if two intervals overlap */
function doIntervalsOverlap(interval1, interval2) {
    var start1 = interval1[0], end1 = interval1[1];
    var start2 = interval2[0], end2 = interval2[1];
    var overlapAmount = Math.max(0, Math.min(end1, end2) - Math.max(start1, start2));
    return overlapAmount > 0;
}
exports.doIntervalsOverlap = doIntervalsOverlap;
/** Test for near equivalence in float values.  From here http://realtimecollisiondetection.net/blog/?p=89 */
function isClose(a, b, relTol, abs_tol) {
    if (relTol === void 0) { relTol = 1e-14; }
    if (abs_tol === void 0) { abs_tol = 0.0; }
    return Math.abs(a - b) <= Math.max(relTol * Math.max(Math.abs(a), Math.abs(b)), abs_tol);
}
exports.isClose = isClose;
/** Pass to sort, when sorting a list of entries to sort entries by start time */
function sortCompareEntriesByTime(x, y) {
    return x[0] - y[0];
}
exports.sortCompareEntriesByTime = sortCompareEntriesByTime;
/**
 * Builds a balanced binary tree from an entry list for quickly finding things at certain times
 * @param {Array} entryList - can consist of intervals or points in time
 * @return {Object} The root node of the tree. Each node has a left and right branch;
 *  nodes in the left branch occur in time before the start time in parent nodes
 *  nodes in the right branch occur in time after the stop time in parent nodes
 */
function entryListToTree(entryList) {
    entryList.sort(sortCompareEntriesByTime);
    var rootNode = recEntryListToTree(entryList);
    return rootNode;
}
exports.entryListToTree = entryListToTree;
/** Helper function that recursively builds a balanced binary tree */
function recEntryListToTree(entryList) {
    var currentNode = null;
    if (entryList.length > 0) {
        var halfIndex = Math.floor(entryList.length / 2);
        var entry = entryList[halfIndex];
        currentNode = { entry: entry, left: null, right: null };
        currentNode.left = recEntryListToTree(entryList.slice(0, halfIndex));
        currentNode.right = recEntryListToTree(entryList.slice(halfIndex + 1, entryList.length + 1));
    }
    return currentNode;
}
/**
 * Returns the interval in an IntervalTier that contains the given time
 * @param {number} time
 * @param {Object} rootNode - a tree built from entryListToTree()
 * @return {Array} The matched interval.  Of the form [start, stop, label].
 */
function findIntervalAtTime(time, rootNode) {
    var currNode = rootNode;
    var matchNode = null;
    while (currNode !== null) {
        if (currNode.entry[0] <= time && currNode.entry[1] >= time) {
            matchNode = currNode;
            break;
        }
        else if (currNode.entry[0] > time) {
            currNode = currNode.left;
        }
        else {
            currNode = currNode.right;
        }
    }
    return matchNode ? matchNode.entry : null;
}
exports.findIntervalAtTime = findIntervalAtTime;
/**
 * Returns the point in a PointTier that occurs at a specific time
 * @param {number} time
 * @param {Object} rootNode - a tree built from entryListToTree()
 * @param {boolean} [findClosest=false] - If true, return the entryList point that is closest to this time, even if its not an exact match.
 *  If false, only return exact matches.
 * @return {Array} The matched point.  Of the form [time, label].
 */
function findPointAtTime(time, rootNode, findClosest) {
    if (findClosest === void 0) { findClosest = false; }
    var currNode = rootNode;
    var matchNode = null;
    var closestNode = rootNode;
    while (currNode !== null) {
        var newDiff = Math.abs(currNode.entry[0] - time);
        var oldDiff = Math.abs(closestNode.entry[0] - time);
        if (newDiff <= oldDiff) {
            // In the case two values are equidistant from the target time
            // choose the earlier of the  values
            if (newDiff !== oldDiff || currNode.entry[0] < closestNode.entry[0]) {
                closestNode = currNode;
            }
        }
        if (currNode.entry[0] === time) {
            matchNode = currNode;
            break;
        }
        else if (currNode.entry[0] > time) {
            currNode = currNode.left;
        }
        else {
            currNode = currNode.right;
        }
    }
    if (findClosest === true && matchNode === null) {
        matchNode = closestNode;
    }
    return matchNode ? matchNode.entry : null;
}
exports.findPointAtTime = findPointAtTime;

"use strict";
/**
 * This module contains the datastructures used for working with
 * Textgrids, IntervalTiers, and PointTiers, and the primary
 * functions used to operate over them.<br /><br />
 *
 * A Textgrid() is a container for annotation tiers. Annotation tiers
 * come in two varieties: IntervalTier and PointTier. With this library,
 * a textgrid can be queried, be used to filter data points, cleaned,
 * or algorithmically altered, etc.
 *
 * @author Nianyi Wang
 * @since September 8, 2022
 * @module textgrid
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.MIN_INTERVAL_LENGTH = exports.POINT_TIER = exports.INTERVAL_TIER = exports.IndexException = exports.TextgridCollisionException = exports.TierCreationException = exports.TierExistsException = exports.findLabelInTier = exports.getNonEntriesFromIntervalTier = exports.getEntriesInInterval = exports.getValuesInIntervals = exports.getValuesAtPoints = exports.copyTier = exports.copyTextgrid = exports.compareIntervals = exports.comparePoints = exports.compareEntries = exports.compareTiers = exports.compareTextgrids = exports.PointTier = exports.IntervalTier = exports.Textgrid = void 0;
var utils_js_1 = require("./utils.js");
var INTERVAL_TIER = 'IntervalTier';
exports.INTERVAL_TIER = INTERVAL_TIER;
var POINT_TIER = 'TextTier';
exports.POINT_TIER = POINT_TIER;
var MIN_INTERVAL_LENGTH = 0.00000001; // Arbitrary threshold
exports.MIN_INTERVAL_LENGTH = MIN_INTERVAL_LENGTH;
var TierExistsException = /** @class */ (function (_super) {
    __extends(TierExistsException, _super);
    function TierExistsException(tierName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.tierName = tierName;
        _this.message = "Tier name ".concat(tierName, " already exists in textgrid");
        return _this;
    }
    return TierExistsException;
}(Error));
exports.TierExistsException = TierExistsException;
;
var TierCreationException = /** @class */ (function (_super) {
    __extends(TierCreationException, _super);
    function TierCreationException(errStr) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.errStr = errStr;
        _this.message = "Couldn't create tier: " + errStr;
        return _this;
    }
    return TierCreationException;
}(Error));
exports.TierCreationException = TierCreationException;
;
var TextgridCollisionException = /** @class */ (function (_super) {
    __extends(TextgridCollisionException, _super);
    function TextgridCollisionException(tierName, entry, matchList) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.tierName = tierName;
        _this.entry = entry;
        _this.matchList = matchList;
        _this.message = "Attempted to insert interval [".concat(entry, "] into tier '").concat(tierName, "' of textgrid but overlapping entries [").concat(matchList, "] already exist.");
        return _this;
    }
    return TextgridCollisionException;
}(Error));
exports.TextgridCollisionException = TextgridCollisionException;
;
var IndexException = /** @class */ (function (_super) {
    __extends(IndexException, _super);
    function IndexException(indexVal, listLength) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.indexVal = indexVal;
        _this.listLength = listLength;
        _this.message = "Attempted to index a list of length ".concat(listLength, " with index ").concat(indexVal, ".");
        return _this;
    }
    return IndexException;
}(Error));
exports.IndexException = IndexException;
;
/**
 * Abstract class for tiers.
 * @abstract
 * @hideconstructor
 */
var TextgridTier = /** @class */ (function () {
    function TextgridTier(name, entryList, minT, maxT) {
        // Don't allow a timeless tier to exist
        if (minT === null || maxT === null)
            throw new TierCreationException('All textgrid tiers must have a min and max timestamp');
        this.name = name;
        this.entryList = entryList;
        this.minTimestamp = minT;
        this.maxTimestamp = maxT;
        this.tierType = null;
        this.sort();
    }
    /**
     * Remove an entry from the tier's entryList
     * @param {Array} entry - the entry to remove
     */
    TextgridTier.prototype.deleteEntry = function (entry) {
        var deleteI = -1;
        for (var i = 0; i < this.entryList.length; i++) {
            if (compareEntries(this.entryList[i], entry)) {
                deleteI = i;
                break;
            }
        }
        if (deleteI === -1) {
            throw new IndexException(deleteI, this.entryList.length);
        }
        this.entryList.splice(deleteI, 1);
    };
    TextgridTier.prototype.sort = function () {
        this.entryList.sort(utils_js_1.sortCompareEntriesByTime);
    };
    return TextgridTier;
}());
/**
 * Class representing an PointTier.
 * @augments TextgridTier
 * @inheritdoc
 */
var PointTier = /** @class */ (function (_super) {
    __extends(PointTier, _super);
    /**
     * @constructor
     * @param {Array} entryList - each entry is of the form [time, label]
     */
    function PointTier(name, entryList, minT, maxT) {
        var _this = this;
        entryList = entryList.map(function (_a) {
            var timeV = _a[0], label = _a[1];
            return [parseFloat(timeV), label];
        });
        // Determine the min and max timestamps
        var timeList = entryList.map(function (entry) { return entry[0]; });
        timeList.push(minT);
        if (timeList.length > 0)
            minT = Math.min.apply(Math, timeList);
        timeList.push(maxT);
        if (timeList.length > 0)
            maxT = Math.max.apply(Math, timeList);
        // Finish intialization
        _this = _super.call(this, name, entryList, minT, maxT) || this;
        _this.tierType = POINT_TIER;
        _this.labelIndex = 1;
        return _this;
    }
    /**
     * Insert an entry into the tier
     * @param {Array} entry - of the form [time, label]
     * @param {boolean} [warnFlag=true] - if the entry collides with an existing entry, warn the user?
     * @param {string} [collisionCode=null] - the action to take if there is a collision
     */
    PointTier.prototype.insertEntry = function (entry, warnFlag, collisionCode) {
        if (warnFlag === void 0) { warnFlag = true; }
        if (collisionCode === void 0) { collisionCode = null; }
        var startTime = entry[0];
        var match = null;
        for (var i = 0; i < this.entryList.length; i++) {
            if ((0, utils_js_1.isClose)(startTime, this.entryList[i][0])) {
                match = this.entryList[i];
                break;
            }
        }
        if (!match) {
            this.entryList.push(entry);
        }
        else if (collisionCode && collisionCode.toLowerCase() === 'replace') {
            this.deleteEntry(match);
            this.entryList.push(entry);
        }
        else if (collisionCode && collisionCode.toLowerCase() === 'merge') {
            var newEntry = [match[0], [match[1], entry[1]].join('-')];
            this.deleteEntry(match);
            this.entryList.push(newEntry);
        }
        else {
            throw new TextgridCollisionException(this.name, entry, match);
        }
        this.sort();
        if (match && warnFlag === true) {
            var msg = "Collision warning for [".concat(entry, "] with items [").concat(match, "] of tier '").concat(this.name, "'");
            console.log(msg);
        }
    };
    return PointTier;
}(TextgridTier));
exports.PointTier = PointTier;
/**
 * Class representing an IntervalTier.
 * @augments TextgridTier
 */
var IntervalTier = /** @class */ (function (_super) {
    __extends(IntervalTier, _super);
    /**
     * @constructor
     * @param {string} name
     * @param {Array} entryList - each entry is of the form [start time, end time, label]
     * @param {number} [minT=null] - the smallest time; if null use 0
     * @param {number} [maxT=null] - the maximum length of the tier; if null use the last timestamp found in the entryList
     */
    function IntervalTier(name, entryList, minT, maxT) {
        if (minT === void 0) { minT = null; }
        if (maxT === void 0) { maxT = null; }
        var _this = this;
        entryList = entryList.map(function (_a) {
            var startTime = _a[0], endTime = _a[1], label = _a[2];
            return [parseFloat(startTime), parseFloat(endTime), label];
        });
        // Determine the min and max timestamps
        var startTimeList = entryList.map(function (entry) { return entry[0]; });
        if (minT !== null)
            startTimeList.push(parseFloat(minT));
        if (startTimeList.length > 0)
            minT = Math.min.apply(Math, startTimeList);
        var endTimeList = entryList.map(function (entry) { return entry[1]; });
        if (maxT !== null)
            endTimeList.push(parseFloat(maxT));
        if (endTimeList.length > 0)
            maxT = Math.max.apply(Math, endTimeList);
        // Finish initialization
        _this = _super.call(this, name, entryList, minT, maxT) || this;
        _this.tierType = INTERVAL_TIER;
        _this.labelIndex = 2;
        return _this;
    }
    /**
     * Insert an entry into the tier
     * @param {Array} entry - of the form [start time, end time, label]
     * @param {boolean} [warnFlag=true] - if the entry collides with an existing entry, warn the user?
     * @param {string} [collisionCode=null] - the action to take if there is a collision
     */
    IntervalTier.prototype.insertEntry = function (entry, warnFlag, collisionCode) {
        if (warnFlag === void 0) { warnFlag = false; }
        if (collisionCode === void 0) { collisionCode = null; }
        var startTime = entry[0];
        var endTime = entry[1];
        var matchList = getEntriesInInterval(this, startTime, endTime);
        if (matchList.length === 0) {
            this.entryList.push(entry);
        }
        else if (collisionCode && collisionCode.toLowerCase() === 'replace') {
            for (var i = 0; i < matchList.length; i++) {
                this.deleteEntry(matchList[i]);
            }
            this.entryList.push(entry);
        }
        else if (collisionCode && collisionCode.toLowerCase() === 'merge') {
            for (var i = 0; i < matchList.length; i++) {
                this.deleteEntry(matchList[i]);
            }
            matchList.push(entry);
            matchList.sort(utils_js_1.sortCompareEntriesByTime);
            var startTimes = matchList.map(function (entry) { return entry[0]; });
            var endTimes = matchList.map(function (entry) { return entry[1]; });
            var labels = matchList.map(function (entry) { return entry[2]; });
            var newEntry = [
                Math.min.apply(Math, startTimes),
                Math.max.apply(Math, endTimes),
                labels.join('-')
            ];
            this.entryList.push(newEntry);
        }
        else {
            throw new TextgridCollisionException(this.name, entry, matchList);
        }
        this.sort();
        if (matchList && warnFlag === true) {
            var msg = "Collision warning for [".concat(entry, "] with items [").concat(matchList, "] of tier '").concat(this.name, "'");
            console.log(msg);
        }
    };
    return IntervalTier;
}(TextgridTier));
exports.IntervalTier = IntervalTier;
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
var Textgrid = /** @class */ (function () {
    function Textgrid() {
        this.tierNameList = [];
        this.tierDict = {};
        this.minTimestamp = null;
        this.maxTimestamp = null;
    }
    /**
     * Adds a tier to the textgrid.  Added to the end, unless an index is specified.
     * @param {TextgridTier} tier
     * @param {number} [tierIndex=null] - The index to insert at.  If null, add it to the end.
     */
    Textgrid.prototype.addTier = function (tier, tierIndex) {
        if (tierIndex === void 0) { tierIndex = null; }
        if (Object.keys(this.tierDict).includes(tier.name)) {
            throw new TierExistsException(tier.name);
        }
        if (tierIndex === null)
            this.tierNameList.push(tier.name);
        else
            this.tierNameList.splice(tierIndex, 0, tier.name);
        this.tierDict[tier.name] = tier;
        if (this.minTimestamp === null) {
            this.minTimestamp = tier.minTimestamp;
        }
        if (this.maxTimestamp === null) {
            this.maxTimestamp = tier.maxTimestamp;
        }
        this._homogonizeMinMaxTimestamps();
    };
    /**
     * Makes all min and max timestamps within a textgrid the same
     * @ignore
     */
    Textgrid.prototype._homogonizeMinMaxTimestamps = function () {
        var _this = this;
        var minTimes = this.tierNameList.map(function (tierName) { return _this.tierDict[tierName].minTimestamp; });
        var maxTimes = this.tierNameList.map(function (tierName) { return _this.tierDict[tierName].maxTimestamp; });
        var minTimestamp = Math.min.apply(Math, minTimes);
        var maxTimestamp = Math.max.apply(Math, maxTimes);
        this.minTimestamp = minTimestamp;
        for (var i = 0; i < this.tierNameList.length; i++) {
            var tierName = this.tierNameList[i];
            this.tierDict[tierName].minTimestamp = minTimestamp;
        }
        this.maxTimestamp = maxTimestamp;
        for (var i = 0; i < this.tierNameList.length; i++) {
            var tierName = this.tierNameList[i];
            this.tierDict[tierName].maxTimestamp = maxTimestamp;
        }
    };
    /**
     * Renames one tier.  The new name must not exist in the textgrid already.
     * @param {string} oldName
     * @param {string} newName
     */
    Textgrid.prototype.renameTier = function (oldName, newName) {
        if (Object.keys(this.tierDict).includes(newName)) {
            throw new TierExistsException(newName);
        }
        var oldTier = this.tierDict[oldName];
        var tierIndex = this.tierNameList.indexOf(oldName);
        var newTier = copyTier(oldTier, { name: newName });
        this.removeTier(oldName);
        this.addTier(newTier, tierIndex);
    };
    /**
     * Removes the given tier from this textgrid.
     * @param {string} name
     */
    Textgrid.prototype.removeTier = function (name) {
        this.tierNameList.splice(this.tierNameList.indexOf(name), 1);
        delete this.tierDict[name];
    };
    /**
     * Replace the tier with the given name with a new tier
     * @param {string} name
     * @param {TextgridTier} newTier
     */
    Textgrid.prototype.replaceTier = function (name, newTier) {
        var tierIndex = this.tierNameList.indexOf(name);
        this.removeTier(name);
        this.addTier(newTier, tierIndex);
    };
    return Textgrid;
}());
exports.Textgrid = Textgrid;
/**
 * Returns true if the two textgrids are the same, false otherwise
 * @param {Textgrid} tg1
 * @param {Textgrid} tg2
 * @return {boolean}
 */
function compareTextgrids(tg1, tg2) {
    var isEqual = true;
    isEqual && (isEqual = (0, utils_js_1.isClose)(tg1.minTimestamp, tg2.minTimestamp));
    isEqual && (isEqual = (0, utils_js_1.isClose)(tg1.maxTimestamp, tg2.maxTimestamp));
    isEqual && (isEqual = tg1.tierNameList.length === tg2.tierNameList.length);
    for (var i = 0; i < tg1.tierNameList.length; i++) {
        isEqual && (isEqual = tg1.tierNameList[i] === tg2.tierNameList[i]);
    }
    for (var i = 0; i < tg1.tierNameList.length; i++) {
        var tierName = tg1.tierNameList[i];
        isEqual && (isEqual = compareTiers(tg1.tierDict[tierName], tg2.tierDict[tierName]));
    }
    return !!isEqual;
}
exports.compareTextgrids = compareTextgrids;
/**
 * Returns true if the two tiers are the same, false otherwise
 * @param {TextgridTier} tier1
 * @param {TextgridTier} tier2
 * @return {boolean}
 */
function compareTiers(tier1, tier2) {
    var isEqual = true;
    isEqual && (isEqual = tier1.name === tier2.name);
    isEqual && (isEqual = (0, utils_js_1.isClose)(tier1.minTimestamp, tier2.minTimestamp));
    isEqual && (isEqual = (0, utils_js_1.isClose)(tier1.maxTimestamp, tier2.maxTimestamp));
    isEqual && (isEqual = tier1.entryList.length === tier2.entryList.length);
    if (isEqual) {
        for (var i = 0; i < tier1.entryList.length; i++) {
            isEqual && (isEqual = compareEntries(tier1.entryList[i], tier2.entryList[i]));
        }
    }
    return !!isEqual;
}
exports.compareTiers = compareTiers;
/**
 * Returns true if the two entries are the same, false otherwise
 * @param {Array} entryA
 * @param {Array} entryB
 * @return {boolean}
 */
function compareEntries(entryA, entryB) {
    var areEqual;
    if (entryA.length === 2) {
        areEqual = comparePoints(entryA, entryB);
    }
    else if (entryA.length === 3) {
        areEqual = compareIntervals(entryA, entryB);
    }
    return areEqual;
}
exports.compareEntries = compareEntries;
function comparePoints(pointA, pointB) {
    var areEqual = true;
    areEqual && (areEqual = (0, utils_js_1.isClose)(pointA[0], pointB[0]));
    areEqual && (areEqual = pointA[1] === pointB[1]);
    return !!areEqual;
}
exports.comparePoints = comparePoints;
function compareIntervals(intervalA, intervalB) {
    var areEqual = true;
    areEqual && (areEqual = (0, utils_js_1.isClose)(intervalA[0], intervalB[0]));
    areEqual && (areEqual = (0, utils_js_1.isClose)(intervalA[1], intervalB[1]));
    areEqual && (areEqual = intervalA[2] === intervalB[2]);
    return !!areEqual;
}
exports.compareIntervals = compareIntervals;
/**
 * Returns a deep copy of a textgrid.
 * @param {Textgrid} tg
 * @return {Textgrid}
 */
function copyTextgrid(tg) {
    var textgrid = new Textgrid();
    for (var i = 0; i < tg.tierNameList.length; i++) {
        var tierName = tg.tierNameList[i];
        textgrid.addTier(copyTier(tg.tierDict[tierName]));
    }
    textgrid.minTimestamp = tg.minTimestamp;
    textgrid.maxTimestamp = tg.maxTimestamp;
    return textgrid;
}
exports.copyTextgrid = copyTextgrid;
/**
 * Returns a deep copy of a tier
 * @param {TextgridTier} tier
 * @param {Object} - an object containing optional values to replace those in the copy.  If the four paramaters name, entryList, minTimestamp, and maxTimestamp are null or not specified, those in the tier will be used (default behaviour).
 * @return {TextgridTier}
 */
function copyTier(tier, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.name, name = _c === void 0 ? null : _c, _d = _b.entryList, entryList = _d === void 0 ? null : _d, _e = _b.minTimestamp, minTimestamp = _e === void 0 ? null : _e, _f = _b.maxTimestamp, maxTimestamp = _f === void 0 ? null : _f;
    if (name === null)
        name = tier.name;
    if (entryList === null)
        entryList = tier.entryList.map(function (entry) { return entry.slice(); });
    if (minTimestamp === null)
        minTimestamp = tier.minTimestamp;
    if (maxTimestamp === null)
        maxTimestamp = tier.maxTimestamp;
    return new tier.constructor(name, entryList, minTimestamp, maxTimestamp);
}
exports.copyTier = copyTier;
/**
 * Get the values that occur at points in the point tier.
 * @param {PointTier} pointTier
 * @param {Array} dataTupleList - should be ordered in time;
 *  must be of the form [(t1, v1a, v1b, ..), (t2, v2a, v2b, ..), ..]
 * @return {Array}
 */
function getValuesAtPoints(pointTier, dataTupleList) {
    var searchTree = (0, utils_js_1.entryListToTree)(pointTier.entryList);
    var returnList = [];
    for (var i = 0; i < dataTupleList.length; i++) {
        var currentEntry = dataTupleList[i];
        if ((0, utils_js_1.findPointAtTime)(currentEntry[0], searchTree, false) !== null) {
            returnList.push(currentEntry);
        }
    }
    return returnList;
}
exports.getValuesAtPoints = getValuesAtPoints;
/**
 * Returns data from dataTupleList contained in labeled intervals
 * @params {IntervalTier} intervalTier
 * @params {Array} dataTupleList  - should be of the form: [(time1, value1a, value1b,..), (time2, value2a, value2b..), ..]
 * @return {Array}
 */
function getValuesInIntervals(intervalTier, dataTupleList) {
    var searchTree = (0, utils_js_1.entryListToTree)(intervalTier.entryList);
    var returnList = [];
    for (var i = 0; i < dataTupleList.length; i++) {
        var currentEntry = dataTupleList[i];
        if ((0, utils_js_1.findIntervalAtTime)(currentEntry[0], searchTree) !== null) {
            returnList.push(currentEntry);
        }
    }
    return returnList;
}
exports.getValuesInIntervals = getValuesInIntervals;
/**
 * Given an interval, returns entries in an interval tier that are in or (for intervals) that partially overlap with it
 * @params {TextgridTier} tier
 * @params {number} startTime
 * @params {number} endTime
 * @return {Array} entryList
 */
function getEntriesInInterval(tier, startTime, endTime) {
    var entryList;
    if (tier instanceof PointTier) {
        entryList = getPointTierEntriesInInterval(tier, startTime, endTime);
    }
    else if (tier instanceof IntervalTier) {
        entryList = getIntervalTierEntriesInInterval(tier, startTime, endTime);
    }
    return entryList;
}
exports.getEntriesInInterval = getEntriesInInterval;
function getIntervalTierEntriesInInterval(intervalTier, startTime, endTime) {
    var entryList = [];
    for (var i = 0; i < intervalTier.entryList.length; i++) {
        var entry = intervalTier.entryList[i];
        if ((0, utils_js_1.doIntervalsOverlap)([startTime, endTime], entry)) {
            entryList.push(entry);
        }
    }
    return entryList;
}
function getPointTierEntriesInInterval(pointTier, startTime, endTime) {
    var entryList = [];
    for (var i = 0; i < pointTier.entryList.length; i++) {
        var entry = pointTier.entryList[i];
        if (entry[0] >= startTime && entry[0] <= endTime) {
            entryList.push(entry);
        }
    }
    return entryList;
}
/**
 * Returns the regions of the textgrid without labels
 * @params {IntervalTier} intervalTier
 * @return {Array} invertedEntryList - where each entry looks like [start time, end time, '']
 */
function getNonEntriesFromIntervalTier(intervalTier) {
    var invertedEntryList = [];
    // Special case--the entry list is empty
    if (intervalTier.entryList.length === 0)
        return [[intervalTier.minTimestamp, intervalTier.maxTimestamp, '']];
    if (intervalTier.entryList[0][0] > 0) {
        invertedEntryList.push([0, intervalTier.entryList[0][0], '']);
    }
    for (var i = 0; i < intervalTier.entryList.length - 1; i++) {
        var currEnd = intervalTier.entryList[i][1];
        var nextStart = intervalTier.entryList[i + 1][0];
        if (currEnd !== nextStart) {
            invertedEntryList.push([currEnd, nextStart, '']);
        }
    }
    var lastI = intervalTier.entryList.length - 1;
    if (intervalTier.entryList[lastI][1] < intervalTier.maxTimestamp) {
        invertedEntryList.push([intervalTier.entryList[lastI][1], intervalTier.maxTimestamp, '']);
    }
    return invertedEntryList;
}
exports.getNonEntriesFromIntervalTier = getNonEntriesFromIntervalTier;
/**
 * Returns the indexes of the entries that match the search label
 * @params {TextgridTier} tier
 * @params {string} searchLabel
 * @params {string} [mode=null] If null, look for exact matches; if 're', match using regular expressions; if 'substr' look for substring matches
 * @return {Array}
 */
function findLabelInTier(tier, searchLabel, mode) {
    if (mode === void 0) { mode = null; }
    var cmprFunc;
    if (mode === 're') {
        cmprFunc = function (text, reStr) { return RegExp(reStr).test(text); };
    }
    else if (mode === 'substr') {
        cmprFunc = function (text, subStr) { return text.includes(subStr); };
    }
    else {
        cmprFunc = function (text, searchText) { return text === searchText; };
    }
    // Run the search
    var returnList = [];
    for (var i = 0; i < tier.entryList.length; i++) {
        if (cmprFunc(tier.entryList[i][tier.labelIndex], searchLabel))
            returnList.push(i);
    }
    return returnList;
}
exports.findLabelInTier = findLabelInTier;

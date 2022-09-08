"use strict";
/**
 * This module contains the methods that take one or more
 * tiers or textgrids and returns a modified result.<br /><br />
 *
 * @author Nianyi Wang
 * @since September 8, 2022
 * @module textgrid_modifiers
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
exports.IncorrectArgumentException = exports.OvershootModificationException = exports.NonMatchingTiersException = exports.takeIntervalTierIntersection = exports.takeIntervalTierDifference = exports.takeTierUnion = exports.mergeTextgridTiers = exports.insertSpaceIntoTier = exports.insertSpaceIntoTextgrid = exports.eraseRegionFromTier = exports.eraseRegionFromTextgrid = exports.editTierTimestamps = exports.editTextgridTimestamps = exports.cropTier = exports.cropTextgrid = exports.appendTier = exports.appendTextgrid = void 0;
var textgrid_js_1 = require("./textgrid.js");
var NonMatchingTiersException = /** @class */ (function (_super) {
    __extends(NonMatchingTiersException, _super);
    function NonMatchingTiersException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NonMatchingTiersException;
}(Error));
exports.NonMatchingTiersException = NonMatchingTiersException;
;
var OvershootModificationException = /** @class */ (function (_super) {
    __extends(OvershootModificationException, _super);
    function OvershootModificationException(tierName, oldEntry, newEntry, min, max) {
        var args = [];
        for (var _i = 5; _i < arguments.length; _i++) {
            args[_i - 5] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.tierName = tierName;
        _this.oldEntry = oldEntry;
        _this.newEntry = newEntry;
        _this.min = min;
        _this.max = max;
        _this.message = "Attempted to change [".concat(oldEntry, "] to [").concat(newEntry, "] in tier '").concat(tierName, "' however, this exceeds the bounds (").concat(min, ",").concat(max, ").");
        return _this;
    }
    return OvershootModificationException;
}(Error));
exports.OvershootModificationException = OvershootModificationException;
;
var IncorrectArgumentException = /** @class */ (function (_super) {
    __extends(IncorrectArgumentException, _super);
    function IncorrectArgumentException(value, targetValueList) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.value = value;
        _this.targetValueList = targetValueList;
        _this.message = "Expected value '".concat(_this.value, "' to be one value in [").concat(_this.targetValueList, "].");
        return _this;
    }
    return IncorrectArgumentException;
}(Error));
exports.IncorrectArgumentException = IncorrectArgumentException;
/**
 * Append one textgrid to the end of this one
 * @param {Textgrid} tg1 - the source textgrid
 * @param {Textgrid} tg2 - the textgrid to add on
 * @param {boolean} [onlyMatchingNames=true] - only include tiers that appear in both textgrids
 * @return {Textgrid}
 */
function appendTextgrid(tg1, tg2, onlyMatchingNames) {
    if (onlyMatchingNames === void 0) { onlyMatchingNames = true; }
    // Get all tier names with no duplicates.  Ordered first by
    // this textgrid and then by the other textgrid.
    var combinedTierNameList = tg1.tierNameList.slice(0);
    for (var i = 0; i < tg2.tierNameList.length; i++) {
        var tierName = tg2.tierNameList[i];
        if (!combinedTierNameList.includes(tierName)) {
            combinedTierNameList.push(tierName);
        }
    }
    // Determine the tier names that will be in the final textgrid
    var finalTierNameList = [];
    if (onlyMatchingNames === false) {
        finalTierNameList = combinedTierNameList;
    }
    else {
        for (var i = 0; i < tg2.tierNameList.length; i++) {
            var tierName = tg2.tierNameList[i];
            if (tg1.tierNameList.includes(tierName) && tg2.tierNameList.includes(tierName)) {
                finalTierNameList.push(tierName);
            }
        }
    }
    // Add tiers from this textgrid
    var retTg = new textgrid_js_1.Textgrid();
    var minTimestamp = tg1.minTimestamp;
    var maxTimestamp = tg1.maxTimestamp + tg2.maxTimestamp;
    for (var i = 0; i < finalTierNameList.length; i++) {
        var tierName = finalTierNameList[i];
        if (!tg1.tierNameList.includes(tierName))
            continue;
        var tier = tg1.tierDict[tierName];
        tier = (0, textgrid_js_1.copyTier)(tier, { minTimestamp: minTimestamp, maxTimestamp: maxTimestamp });
        retTg.addTier(tier);
    }
    // Add tiers from the other textgrid
    for (var i = 0; i < finalTierNameList.length; i++) {
        var tierName = finalTierNameList[i];
        if (!tg2.tierNameList.includes(tierName))
            continue;
        var tier = tg2.tierDict[tierName];
        tier = (0, textgrid_js_1.copyTier)(tier, { minTimestamp: minTimestamp, maxTimestamp: maxTimestamp });
        tier = editTierTimestamps(tier, tg1.maxTimestamp);
        if (!retTg.tierNameList.includes(tierName)) {
            retTg.addTier(tier);
        }
        else {
            var combinedTier = retTg.tierDict[tierName];
            var combinedEntryList = combinedTier.entryList;
            combinedEntryList = combinedEntryList.concat(tier.entryList);
            combinedTier = (0, textgrid_js_1.copyTier)(combinedTier, { entryList: combinedEntryList });
            retTg.replaceTier(tierName, combinedTier);
        }
    }
    return retTg;
}
exports.appendTextgrid = appendTextgrid;
/**
 * Add one tier to the end of another
 * @param {TextgridTier} tier1 - the base tier
 * @param {TextgridTier} tier2 - the tier to add
 * @return {TextgridTier}
 */
function appendTier(tier1, tier2) {
    if (tier1.tierType !== tier2.tierType) {
        throw new NonMatchingTiersException('Tier types must match when appending tiers.');
    }
    var minTime = tier1.minTimestamp;
    var maxTime = tier1.maxTimestamp + tier2.maxTimestamp;
    var appendTier = editTierTimestamps(tier2, tier1.maxTimestamp, true);
    var entryList = tier1.entryList.concat(appendTier.entryList);
    return (0, textgrid_js_1.copyTier)(tier1, {
        name: tier1.name,
        entryList: entryList,
        minTimestamp: minTime,
        maxTimestamp: maxTime
    });
}
exports.appendTier = appendTier;
/**
 * Creates a textgrid that only contains intervals from the crop region
 * @param {Textgrid} tg
 * @param {number} cropStart
 * @param {number} cropEnd
 * @param {string} mode - one of 'strict', 'lax', or 'truncated'
 *  If 'strict', only intervals wholly contained by the crop interval will be kept.
 *  If 'lax', partially contained intervals will be kept.
 *  If 'truncated', partially contained intervals will be truncated to fit within the crop region.
 * @param {boolean} rebaseToZero - if true, the all times in entries will be subtracted by the cropStart
 * @return {Textgrid} A new textgrid containing only entries that appear in the crop region.
 */
function cropTextgrid(tg, cropStart, cropEnd, mode, rebaseToZero) {
    var newTG = new textgrid_js_1.Textgrid();
    var minT = cropStart;
    var maxT = cropEnd;
    if (rebaseToZero === true) {
        minT = 0;
        maxT = cropEnd - cropStart;
    }
    newTG.minTimestamp = minT;
    newTG.maxTimestamp = maxT;
    for (var i = 0; i < tg.tierNameList.length; i++) {
        var tierName = tg.tierNameList[i];
        var tier = tg.tierDict[tierName];
        var newTier = cropTier(tier, cropStart, cropEnd, mode, rebaseToZero);
        newTG.addTier(newTier);
    }
    return newTG;
}
exports.cropTextgrid = cropTextgrid;
/**
 * Creates a new tier containing only entries from inside the crop interval
 * @param {TextgridTier} tier
 * @param {number} cropStart
 * @param {number} cropEnd
 * @param {string} mode - mode is ignored.  This parameter is kept for compatibility with IntervalTier.crop()
 * @param {boolean} rebaseToZero - if true, all times will be subtracted by cropStart
 * @return {TextgridTier} Returns a copy of this tier with only values from the crop region.
 */
function cropTier(tier, cropStart, cropEnd, mode, rebaseToZero) {
    var croppedTier;
    if (tier instanceof textgrid_js_1.PointTier) {
        croppedTier = cropPointTier(tier, cropStart, cropEnd, mode, rebaseToZero);
    }
    else if (tier instanceof textgrid_js_1.IntervalTier) {
        croppedTier = cropIntervalTier(tier, cropStart, cropEnd, mode, rebaseToZero);
    }
    return croppedTier;
}
exports.cropTier = cropTier;
/**
 * Creates a new tier containing only entries from inside the crop interval
 * @param {PointTier} pointTier
 * @param {number} cropStart
 * @param {number} cropEnd
 * @param {string} mode - mode is ignored.  This parameter is kept for compatibility with IntervalTier.crop()
 * @param {boolean} rebaseToZero - if true, all times will be subtracted by cropStart
 * @return {PointTier} Returns a copy of this tier with only values from the crop region.
 */
function cropPointTier(pointTier, cropStart, cropEnd, mode, rebaseToZero) {
    var newEntryList = [];
    for (var i = 0; i < pointTier.entryList.length; i++) {
        var timestamp = pointTier.entryList[i][0];
        if (timestamp >= cropStart && timestamp <= cropEnd)
            newEntryList.push(pointTier.entryList[i]);
    }
    var minT = cropStart;
    var maxT = cropEnd;
    if (rebaseToZero === true) {
        newEntryList = newEntryList.map(function (entry) { return [entry[0] - cropStart, entry[1]]; });
        minT = 0;
        maxT = cropEnd - cropStart;
    }
    var subTier = new textgrid_js_1.PointTier(pointTier.name, newEntryList, minT, maxT);
    return subTier;
}
/**
 * Creates a new tier with only the entries from the crop region
 * @param {number} cropStart
 * @param {number} cropEnd
 * @param {string} number - one of 'strict', 'lax', or 'truncated'
        If 'strict', only intervals wholly contained by the crop interval will be kept.
        If 'lax', partially contained intervals will be kept.
        If 'truncated', partially contained intervals will be
                truncated to fit within the crop region.
 * @param {boolean} rebaseToZero - if true the cropped textgrid values will be subtracted by cropStart
 * @return {Textgrid} A copy of this tier with only entries from the crop region
 */
function cropIntervalTier(intervalTier, cropStart, cropEnd, mode, rebaseToZero) {
    var newEntryList = [];
    for (var i = 0; i < intervalTier.entryList.length; i++) {
        var entry = intervalTier.entryList[i];
        var matchedEntry = null;
        var intervalStart = entry[0];
        var intervalEnd = entry[1];
        var intervalLabel = entry[2];
        // Don't need to investigate if the interval is before or after
        // the crop region
        if (intervalEnd <= cropStart || intervalStart >= cropEnd)
            continue;
        // Determine if the current subEntry is wholly contained
        // within the superEntry
        if (intervalStart >= cropStart && intervalEnd <= cropEnd) {
            matchedEntry = entry;
        }
        // If it is only partially contained within the superEntry AND
        // inclusion is 'lax', include it anyways
        else if (mode === 'lax' && (intervalStart >= cropStart || intervalEnd <= cropEnd)) {
            matchedEntry = entry;
        }
        // If not strict, include partial tiers on the edges
        // -- regardless, record how much information was lost
        //        - for strict=true, the total time of the cut interval
        //        - for strict=false, the portion of the interval that lies
        //            outside the new interval
        // The current interval straddles the end of the new interval
        else if (intervalStart >= cropStart && intervalEnd > cropEnd) {
            if (mode === 'truncated') {
                matchedEntry = [intervalStart, cropEnd, intervalLabel];
            }
        }
        // The current interval straddles the start of the new interval
        else if (intervalStart < cropStart && intervalEnd <= cropEnd) {
            if (mode === 'truncated') {
                matchedEntry = [cropStart, intervalEnd, intervalLabel];
            }
        }
        // The current interval contains the new interval completely
        else if (intervalStart <= cropStart && intervalEnd >= cropEnd) {
            if (mode === 'lax') {
                matchedEntry = entry;
            }
            else if (mode === 'truncated') {
                matchedEntry = [cropStart, cropEnd, intervalLabel];
            }
        }
        if (matchedEntry !== null) {
            newEntryList.push(matchedEntry);
        }
    }
    var minT = cropStart;
    var maxT = cropEnd;
    if (rebaseToZero === true) {
        newEntryList = newEntryList.map(function (entryList) { return [entryList[0] - cropStart,
            entryList[1] - cropStart,
            entryList[2]
        ]; });
        minT = 0;
        maxT = cropEnd - cropStart;
    }
    // Create subtier
    var croppedTier = new textgrid_js_1.IntervalTier(intervalTier.name, newEntryList, minT, maxT);
    return croppedTier;
}
/**
 * Modifies all timestamps in the Textgrid and in the contained tiers by a constant amount
 * @param {Textgrid} tg
 * @param {number} offset - the amount to modify all timestamps by
 * @param {boolean} [allowOvershoot=false] - if false and offset pushes a value past maxTimestamp, throw an error; otherwise, lengthen the textgrid
 * @return {Textgrid}
 */
function editTextgridTimestamps(tg, offset, allowOvershoot) {
    if (allowOvershoot === void 0) { allowOvershoot = false; }
    var editedTg = new textgrid_js_1.Textgrid();
    for (var i = 0; i < tg.tierNameList.length; i++) {
        var tier = tg.tierDict[tg.tierNameList[i]];
        tier = editTierTimestamps(tier, offset, allowOvershoot);
        editedTg.addTier(tier);
    }
    return editedTg;
}
exports.editTextgridTimestamps = editTextgridTimestamps;
/**
 * Modifies all timestamps by a constant amount
 * @param {TextgridTier} tier
 * @param {number} offset
 * @param {boolean} [allowOvershoot=false] - if false and offset pushes a value past maxTimestamp, throw an error; otherwise, lengthen the tier
 * @return {TextgridTier}
 */
function editTierTimestamps(tier, offset, allowOvershoot) {
    if (allowOvershoot === void 0) { allowOvershoot = false; }
    var editedTier;
    if (tier instanceof textgrid_js_1.PointTier) {
        editedTier = editPointTierTimestamps(tier, offset, allowOvershoot);
    }
    else if (tier instanceof textgrid_js_1.IntervalTier) {
        editedTier = editIntervalTierTimestamps(tier, offset, allowOvershoot);
    }
    return editedTier;
}
exports.editTierTimestamps = editTierTimestamps;
function editPointTierTimestamps(pointTier, offset, allowOvershoot) {
    if (allowOvershoot === void 0) { allowOvershoot = false; }
    var newEntryList = [];
    for (var i = 0; i < pointTier.entryList.length; i++) {
        var entry = pointTier.entryList[i];
        var newTime = entry[0] + offset;
        var newEntry = [newTime, entry[1]];
        if (allowOvershoot === false) {
            if (newTime < pointTier.minTimestamp || newTime > pointTier.maxTimestamp) {
                throw new OvershootModificationException(pointTier.name, entry, newEntry, pointTier.minTimestamp, pointTier.maxTimestamp);
            }
        }
        newEntryList.push(newEntry);
    }
    var newTimeList = newEntryList.map(function (entry) { return entry[0]; });
    var newMin = Math.min.apply(Math, newTimeList);
    var newMax = Math.max.apply(Math, newTimeList);
    if (pointTier.minTimestamp < newMin)
        newMin = pointTier.minTimestamp;
    if (pointTier.maxTimestamp > newMax)
        newMax = pointTier.maxTimestamp;
    return new textgrid_js_1.PointTier(pointTier.name, newEntryList, newMin, newMax);
}
function editIntervalTierTimestamps(intervalTier, offset, allowOvershoot) {
    if (allowOvershoot === void 0) { allowOvershoot = false; }
    var newEntryList = [];
    for (var i = 0; i < intervalTier.entryList.length; i++) {
        var entry = intervalTier.entryList[i];
        var newStart = entry[0] + offset;
        var newStop = entry[1] + offset;
        var newEntry = [newStart, newStop, entry[2]];
        if (allowOvershoot === false) {
            if (newStart < intervalTier.minTimestamp || newStop > intervalTier.maxTimestamp) {
                throw new OvershootModificationException(intervalTier.name, entry, newEntry, intervalTier.minTimestamp, intervalTier.maxTimestamp);
            }
        }
        newEntryList.push(newEntry);
    }
    var newMin = Math.min.apply(Math, newEntryList.map(function (entry) { return entry[0]; }));
    var newMax = Math.max.apply(Math, newEntryList.map(function (entry) { return entry[1]; }));
    if (intervalTier.minTimestamp < newMin)
        newMin = intervalTier.minTimestamp;
    if (intervalTier.maxTimestamp > newMax)
        newMax = intervalTier.maxTimestamp;
    return new textgrid_js_1.IntervalTier(intervalTier.name, newEntryList, newMin, newMax);
}
/**
 * Makes a region in all tiers blank (removes all contained entries)
 * @param {TextgridTier} tg
 * @param {number} start
 * @param {number} stop
 * @param {boolean} doShrink - if true, all values after the erase region will be shifted earlier in time by (stop - start) seconds
 * @return {TextgridTier} A copy of this textgrid without entries in the specified region.
 */
function eraseRegionFromTextgrid(tg, start, stop, doShrink) {
    var duration = stop - start;
    var maxTimestamp = tg.maxTimestamp;
    if (doShrink === true)
        maxTimestamp -= duration;
    var newTg = new textgrid_js_1.Textgrid();
    newTg.minTimestamp = tg.minTimestamp;
    newTg.maxTimestamp = maxTimestamp;
    for (var i = 0; i < tg.tierNameList.length; i++) {
        var tier = tg.tierDict[tg.tierNameList[i]];
        tier = eraseRegionFromTier(tier, start, stop, doShrink, 'truncated');
        newTg.addTier(tier);
    }
    return newTg;
}
exports.eraseRegionFromTextgrid = eraseRegionFromTextgrid;
/**
 * Makes a region in a tier blank (removes all contained entries)
 * @param {TextgridTier} tier
 * @param {number} start
 * @param {number} stop
 * @param {boolean} doShrink - if true, all values after the erase region will be shifted earlier in time by (stop - start) seconds
 * @return {TextgridTier} A copy of this tier without entries in the specified region.
 */
function eraseRegionFromTier(tier, start, stop, doShrink, collisionCode) {
    var retTier;
    var codeList = ['strict', 'truncated'];
    if (!codeList.includes(collisionCode)) {
        throw new IncorrectArgumentException(collisionCode, codeList);
    }
    // erase region is in the middle of the textgrid
    if (start > tier.minTimestamp && stop < tier.maxTimestamp) {
        var leftCrop = cropTier(tier, tier.minTimestamp, start, collisionCode, false);
        if (doShrink === true) {
            var rightCrop = cropTier(tier, stop, tier.maxTimestamp, collisionCode, true);
            retTier = appendTier(leftCrop, rightCrop);
        }
        else {
            var rightCrop = cropTier(tier, stop, tier.maxTimestamp, collisionCode, false);
            retTier = takeTierUnion(leftCrop, rightCrop);
        }
    }
    // erase region is either at the start or end of the textgrid
    else {
        if (start > tier.minTimestamp && stop >= tier.maxTimestamp) {
            retTier = cropTier(tier, tier.minTimestamp, start, collisionCode, false);
        }
        else if (start <= tier.minTimestamp && stop < tier.maxTimestamp) {
            retTier = cropTier(tier, stop, tier.maxTimestamp, collisionCode, false);
            if (doShrink === true) {
                retTier = editTierTimestamps(retTier, -1 * stop, true);
            }
        }
        else {
            retTier = (0, textgrid_js_1.copyTier)(tier, { entryList: [] });
        }
    }
    if (doShrink !== true) {
        retTier.minTimestamp = tier.minTimestamp;
        retTier.maxTimestamp = tier.maxTimestamp;
    }
    return retTier;
}
exports.eraseRegionFromTier = eraseRegionFromTier;
/**
 * Inserts a blank region into a textgrid
 * @param {Textgrid} tg
 * @param {number} start
 * @param {number} duration - Note: every item that occurs after /start/ will be pushed back by /duration/ seconds.
 * @param {boolean} collisionCode - if /start/ occurs inside a labeled interval, this determines the behaviour.
 *  Must be one of 'stretch', 'split', or 'no change'
 *  'stretch' - stretches the interval by /duration/ amount
 *  'split' - splits the interval into two--everything to the
                        right of 'start' will be advanced by 'duration' seconds
 *  'no change' - leaves the interval as is with no change
 * @return {Textgrid} A copy of this textgrid with the inserted blank region.
 */
function insertSpaceIntoTextgrid(tg, start, duration, collisionCode) {
    var newTg = new textgrid_js_1.Textgrid();
    newTg.minTimestamp = tg.minTimestamp;
    newTg.maxTimestamp = tg.maxTimestmap + duration;
    for (var i = 0; i < tg.tierNameList.length; i++) {
        var tier = tg.tierDict[tg.tierNameList[i]];
        tier = insertSpaceIntoTier(tier, start, duration, collisionCode);
        newTg.addTier(tier);
    }
    return newTg;
}
exports.insertSpaceIntoTextgrid = insertSpaceIntoTextgrid;
/**
 * Inserts a blank region into a tier
 * @param {TextgridTier} tier
 * @param {number} start
 * @param {number} duration - Note: every item that occurs after /start/ will be pushed back by /duration/ seconds.
 * @param {boolean} collisionCode - (unused parameter for point tiers) if /start/ occurs inside a labeled interval, this determines the behaviour.
 *  Must be one of 'stretch', 'split', or 'no change'
 *  'stretch' - stretches the interval by /duration/ amount
 *  'split' - splits the interval into two--everything to the
                        right of 'start' will be advanced by 'duration' seconds
 *  'no change' - leaves the interval as is with no change
 * @return {TextgridTier} A copy of this tier with the inserted blank region.
 */
function insertSpaceIntoTier(tier, start, duration, collisionCode) {
    var lengthenedTier;
    if (tier instanceof textgrid_js_1.PointTier) {
        lengthenedTier = insertSpaceIntoPointTier(tier, start, duration, collisionCode);
    }
    else if (tier instanceof textgrid_js_1.IntervalTier) {
        lengthenedTier = insertSpaceIntoIntervalTier(tier, start, duration, collisionCode);
    }
    return lengthenedTier;
}
exports.insertSpaceIntoTier = insertSpaceIntoTier;
function insertSpaceIntoPointTier(pointTier, start, duration, collisionCode) {
    var newEntryList = [];
    for (var i = 0; i < pointTier.entryList.length; i++) {
        var entry = pointTier.entryList[i];
        if (entry[0] <= start) {
            newEntryList.push(entry);
        }
        else if (entry[0] > start) {
            newEntryList.push([entry[0] + duration, entry[1]]);
        }
    }
    return (0, textgrid_js_1.copyTier)(pointTier, { entryList: newEntryList, maxTimestamp: pointTier.maxTimestamp + duration });
}
function insertSpaceIntoIntervalTier(intervalTier, start, duration, collisionCode) {
    var codeList = ['stretch', 'split', 'no change'];
    if (!codeList.includes(collisionCode)) {
        throw new IncorrectArgumentException(collisionCode, codeList);
    }
    var newEntryList = [];
    for (var i = 0; i < intervalTier.entryList.length; i++) {
        var _a = intervalTier.entryList[i], entryStart = _a[0], entryStop = _a[1], label = _a[2];
        if (entryStop <= start) {
            newEntryList.push([entryStart, entryStop, label]);
        }
        else if (entryStart >= start) {
            newEntryList.push([entryStart + duration, entryStop + duration, label]);
        }
        else if (entryStart <= start && entryStop > start) {
            if (collisionCode === 'stretch') {
                newEntryList.push([entryStart, entryStop + duration, label]);
            }
            else if (collisionCode === 'split') {
                newEntryList.push([entryStart, start, label]);
                newEntryList.push([start + duration, start + duration + (entryStop - start), label]);
            }
            else if (collisionCode === 'no change') {
                newEntryList.push([entryStart, entryStop, label]);
            }
        }
    }
    return (0, textgrid_js_1.copyTier)(intervalTier, { entryList: newEntryList, maxTimestamp: intervalTier.maxTimestamp + duration });
}
/**
 * Combine tiers in a textgrid.
 * @param {Textgrid} tg
 * @param {Array} [tierNameList=null] - The list of tier names to include in the merge.  If null, all tiers are merged.
 * @param {boolean} [preserveOtherTiers=true] - If true, keep tiers that were not merged.
 *  If false, the return textgrid will only have one merged tier for all interval tiers and one merged tier for all point tiers, if present.
 * @param {string} [intervalTierName='merged intervals']
 * @param {string} [pointTierName='merged points']
 * @return {Textgrid} A copy of the textgrid with the specified tiers merged.
 */
function mergeTextgridTiers(tg, tierNameList, preserveOtherTiers, intervalTierName, pointTierName) {
    if (tierNameList === void 0) { tierNameList = null; }
    if (preserveOtherTiers === void 0) { preserveOtherTiers = true; }
    if (intervalTierName === void 0) { intervalTierName = 'merged intervals'; }
    if (pointTierName === void 0) { pointTierName = 'merged points'; }
    if (tierNameList === null) {
        tierNameList = tg.tierNameList;
    }
    // Determine the tiers to merge
    var intervalTierNameList = [];
    var pointTierNameList = [];
    for (var i = 0; i < tierNameList.length; i++) {
        var tierName = tierNameList[i];
        var tier = tg.tierDict[tierName];
        if (tier instanceof textgrid_js_1.IntervalTier) {
            intervalTierNameList.push(tierName);
        }
        else if (tier instanceof textgrid_js_1.PointTier) {
            pointTierNameList.push(tierName);
        }
    }
    // Merge the interval tiers
    var intervalTier = null;
    if (intervalTierNameList.length > 0) {
        intervalTier = tg.tierDict[intervalTierNameList[0]];
        for (var i = 1; i < intervalTierNameList.length; i++) {
            intervalTier = takeTierUnion(intervalTier, tg.tierDict[intervalTierNameList[i]]);
        }
        intervalTier.name = intervalTierName;
    }
    // Merge the point tiers
    var pointTier = null;
    if (pointTierNameList.length > 0) {
        pointTier = tg.tierDict[pointTierNameList[0]];
        for (var i = 1; i < pointTierNameList.length; i++) {
            pointTier = takeTierUnion(pointTier, tg.tierDict[pointTierNameList[i]]);
        }
        pointTier.name = pointTierName;
    }
    // Add unmerged tiers
    var tierNamesToKeep = [];
    if (preserveOtherTiers === true) {
        for (var i = 0; i < tg.tierNameList.length; i++) {
            var currTierName = tg.tierNameList[i];
            if (!tierNameList.includes(currTierName))
                tierNamesToKeep.push(currTierName);
        }
    }
    // Create the final textgrid to output
    var retTg = new textgrid_js_1.Textgrid();
    if (intervalTier !== null)
        retTg.addTier(intervalTier);
    if (pointTier !== null)
        retTg.addTier(pointTier);
    for (var i = 0; i < tierNamesToKeep.length; i++) {
        retTg.addTier(tg.tierDict[tierNamesToKeep[i]]);
    }
    retTg.minTimestamp = tg.minTimestamp;
    retTg.maxTimestamp = tg.maxTimestamp;
    return retTg;
}
exports.mergeTextgridTiers = mergeTextgridTiers;
/**
 * Takes the set union of two tiers.
 * All the entries in the second tier will be added to the first.
 * Overlapping entries will be merged together.
 * @params {TextgridTier} tier1 - the base tier
 * @params {TextgridTier} tier2 - the tier to union into the base tier
 * @return {TextgridTier}
 */
function takeTierUnion(tier1, tier2) {
    var retTier = (0, textgrid_js_1.copyTier)(tier1);
    for (var i = 0; i < tier2.entryList.length; i++) {
        retTier.insertEntry(tier2.entryList[i], false, 'merge');
    }
    retTier.sort();
    return retTier;
}
exports.takeTierUnion = takeTierUnion;
/**
 * Takes the set difference of this tier and the given one.
 * Any overlapping portions of entries with entries in this textgrid
 * will be removed from the returned tier.
 * @params {TextgridTier} tier1 - the base tier
 * @params {TextgridTier} tier2 - the tier to take the difference of with the base tier
 * @return {TextgridTier}
 */
function takeIntervalTierDifference(tier1, tier2) {
    var retTier = (0, textgrid_js_1.copyTier)(tier1);
    for (var i = 0; i < tier2.entryList.length; i++) {
        var entry = tier2.entryList[i];
        retTier = eraseRegionFromTier(retTier, entry[0], entry[1], false, 'truncated');
    }
    return retTier;
}
exports.takeIntervalTierDifference = takeIntervalTierDifference;
/**
 * Takes the set intersection of this tier and the given one.
 * Only intervals that exist in both tiers will remain in the
 * returned tier.  If intervals partially overlap, only the overlapping
 * portion will be returned.
 * @params {TextgridTier} tier1 - the base tier
 * @params {TextgridTier} tier2 - the tier to intersect the base tier with
 * @return {TextgridTier}
 */
function takeIntervalTierIntersection(tier1, tier2) {
    var newEntryList = [];
    var _loop_1 = function (i) {
        var entry = tier1.entryList[i];
        var subTier = cropTier(tier2, entry[0], entry[1], 'truncated', false);
        // Combine the labels in the two tiers
        var stub = entry[2] + '-';
        var subEntryList = subTier.entryList.map(function (subEntry) { return [subEntry[0], subEntry[1], stub + subEntry[2]]; });
        newEntryList = newEntryList.concat(subEntryList);
    };
    for (var i = 0; i < tier1.entryList.length; i++) {
        _loop_1(i);
    }
    var name = tier1.name + '-' + tier2.name;
    var retTier = (0, textgrid_js_1.copyTier)(tier1, { name: name, entryList: newEntryList });
    return retTier;
}
exports.takeIntervalTierIntersection = takeIntervalTierIntersection;

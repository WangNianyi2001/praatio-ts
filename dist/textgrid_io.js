"use strict";
/**
 * This module contains code for converting to and from the Textgrid
 * datastructure.  Textgrid files are typically stored as plain text.
 * This library does not do actual file IO but instead converts
 * to and from loaded strings to instances of Textgrid.
 *
 * @author Nianyi Wang
 * @since September 8, 2022
 * @module textgrid_io
 */
exports.__esModule = true;
exports.prepTgForSaving = exports.decodeBuffer = exports.serializeTextgridToCsv = exports.serializeTextgrid = exports.parseTextgrid = void 0;
var iconvlite = require("iconv-lite");
var textgrid_js_1 = require("./textgrid.js");
var textgrid_modifiers_js_1 = require("./textgrid_modifiers.js");
/**
 * Python-like split from
 * http://stackoverflow.com/questions/6131195/javascript-splitting-string-from-the-first-comma
 * @param {string} str
 * @param {string} separator - the separator to split on
 * @param {number} max - the max number of times to split
 * @return {Array}
 * @ignore
 */
function extendedSplit(str, separator, max) {
    var out = [];
    var index = 0;
    var next;
    if (max) {
        while (out.length < max - 1) {
            next = str.indexOf(separator, index);
            if (next === -1) {
                break;
            }
            out.push(str.substring(index, next));
            index = next + separator.length;
        }
    }
    out.push(str.substring(index));
    return out;
}
function findAllSubstrings(sourceStr, subStr) {
    var indexList = [];
    var index = sourceStr.indexOf(subStr);
    while (index !== -1) {
        indexList.push(index);
        index += 1;
        index = sourceStr.indexOf(subStr, index);
    }
    return indexList;
}
function fetchRow(dataStr, searchStr, index) {
    var startIndex = dataStr.indexOf(searchStr, index) + searchStr.length;
    var endIndex = dataStr.indexOf('\n', startIndex);
    var word = dataStr.substring(startIndex, endIndex);
    word = word.trim();
    if (word[0] === '"' && word[word.length - 1] === '"') {
        word = word.substring(1, word.length - 1);
    }
    word = word.trim();
    // Increment the index by 1, unless nothing was found
    if (endIndex !== -1)
        endIndex += 1;
    return [word, endIndex];
}
function parseNormalTextgrid(data) {
    var _a, _b, _c, _d, _e;
    // Toss header
    var tierList = data.split('item [');
    var textgridHeader = tierList.shift();
    var tgMin = parseFloat(textgridHeader.split('xmin = ', 2)[1].split('\n', 1)[0].trim());
    var tgMax = parseFloat(textgridHeader.split('xmax = ', 2)[1].split('\n', 1)[0].trim());
    // Process each tier individually
    // tierList = data.split('item');
    // tierList = tierList[1,tierList.length];
    var tierTxt = '';
    tierList.shift(); // Removing the document root empty item
    var textgrid = new textgrid_js_1.Textgrid();
    textgrid.minTimestamp = tgMin;
    textgrid.maxTimestamp = tgMax;
    for (var i = 0; i < tierList.length; i++) {
        tierTxt = tierList[i];
        // Get tier type
        var tierType = textgrid_js_1.POINT_TIER;
        var searchWord = 'points';
        if (tierTxt.indexOf('class = "IntervalTier"') > -1) {
            tierType = textgrid_js_1.INTERVAL_TIER;
            searchWord = 'intervals';
        }
        // Get tier meta-information
        var tmpArray = extendedSplit(tierTxt, searchWord + ':', 2);
        var header = tmpArray[0];
        var tierData = tmpArray[1];
        var tierName = header.split('name = ', 2)[1].split('\n', 1)[0].trim();
        tierName = tierName.slice(1, tierName.length - 1); // remove quotes
        var tierStart = header.split('xmin = ', 2)[1].split('\n', 1)[0].trim();
        var tierEnd = header.split('xmax = ', 2)[1].split('\n', 1)[0].trim();
        // Get the tier entry list
        var entryList = [];
        var labelI = 0;
        var label = null;
        var tier = null;
        if (tierType === textgrid_js_1.INTERVAL_TIER) {
            var timeStartI = null;
            var timeEndI = null;
            var timeStart = null;
            var timeEnd = null;
            while (true) {
                _a = fetchRow(tierData, 'xmin = ', labelI), timeStart = _a[0], timeStartI = _a[1];
                // Break condition here.  indexof loops around at the end of a file
                if (timeStartI <= labelI)
                    break;
                _b = fetchRow(tierData, 'xmax = ', timeStartI), timeEnd = _b[0], timeEndI = _b[1];
                _c = fetchRow(tierData, 'text =', timeEndI), label = _c[0], labelI = _c[1];
                label = label.trim();
                entryList.push([parseFloat(timeStart), parseFloat(timeEnd), label]);
            }
            tier = new textgrid_js_1.IntervalTier(tierName, entryList, tierStart, tierEnd);
        }
        else {
            var timePointI = null;
            var timePoint = null;
            while (true) {
                _d = fetchRow(tierData, 'number = ', labelI), timePoint = _d[0], timePointI = _d[1];
                // Break condition here.  indexof loops around at the end of a file
                if (timePointI <= labelI)
                    break;
                _e = fetchRow(tierData, 'mark =', timePointI), label = _e[0], labelI = _e[1];
                label = label.trim();
                entryList.push([parseFloat(timePoint), label]);
            }
            tier = new textgrid_js_1.PointTier(tierName, entryList, tierStart, tierEnd);
        }
        textgrid.addTier(tier);
    }
    return textgrid;
}
function parseShortTextgrid(data) {
    var _a, _b, _c, _d, _e;
    var indexList = [];
    var intervalIndicies = findAllSubstrings(data, '"IntervalTier"');
    for (var i = 0; i < intervalIndicies.length; i++) {
        indexList.push([intervalIndicies[i], true]);
    }
    var pointIndicies = findAllSubstrings(data, '"TextTier"');
    for (var i = 0; i < pointIndicies.length; i++) {
        indexList.push([pointIndicies[i], false]);
    }
    indexList.push([data.length, null]); // The 'end' of the file
    indexList.sort(function (x, y) {
        return x[0] - y[0];
    });
    var tupleList = [];
    for (var i = 0; i < indexList.length - 1; i++) {
        tupleList.push([indexList[i][0], indexList[i + 1][0], indexList[i][1]]);
    }
    // Set the textgrid's min and max times
    var header = data.slice(0, tupleList[0][0]);
    var headerList = header.split('\n');
    var tgMin = parseFloat(headerList[3]);
    var tgMax = parseFloat(headerList[4]);
    // Add the textgrid tiers
    var textgrid = new textgrid_js_1.Textgrid();
    textgrid.minTimestamp = tgMin;
    textgrid.maxTimestamp = tgMax;
    for (var i = 0; i < tupleList.length; i++) {
        var tier = null;
        var blockStartI = tupleList[i][0];
        var blockEndI = tupleList[i][1];
        var isInterval = tupleList[i][2];
        var tierData = data.slice(blockStartI, blockEndI);
        var metaStartI = fetchRow(tierData, '', 0)[1];
        // Tier meta-information
        var _f = fetchRow(tierData, '', metaStartI), tierName = _f[0], tierNameEndI = _f[1];
        var _g = fetchRow(tierData, '', tierNameEndI), tierStartTime = _g[0], tierStartTimeI = _g[1];
        var _h = fetchRow(tierData, '', tierStartTimeI), tierEndTime = _h[0], tierEndTimeI = _h[1];
        var startTimeI = fetchRow(tierData, '', tierEndTimeI)[1];
        tierStartTime = parseFloat(tierStartTime);
        tierEndTime = parseFloat(tierEndTime);
        // Tier entry data
        var startTime = null;
        var endTime = null;
        var label = null;
        // let tierType = null;
        var endTimeI = null;
        var labelI = null;
        var entryList = [];
        if (isInterval === true) {
            while (true) {
                _a = fetchRow(tierData, '', startTimeI), startTime = _a[0], endTimeI = _a[1];
                if (endTimeI === -1)
                    break;
                _b = fetchRow(tierData, '', endTimeI), endTime = _b[0], labelI = _b[1];
                _c = fetchRow(tierData, '', labelI), label = _c[0], startTimeI = _c[1];
                label = label.trim();
                entryList.push([startTime, endTime, label]);
            }
            tier = new textgrid_js_1.IntervalTier(tierName, entryList, tierStartTime, tierEndTime);
        }
        else {
            while (true) {
                _d = fetchRow(tierData, '', startTimeI), startTime = _d[0], labelI = _d[1];
                if (labelI === -1)
                    break;
                _e = fetchRow(tierData, '', labelI), label = _e[0], startTimeI = _e[1];
                label = label.trim();
                entryList.push([startTime, label]);
            }
            tier = new textgrid_js_1.PointTier(tierName, entryList, tierStartTime, tierEndTime);
        }
        textgrid.addTier(tier);
    }
    return textgrid;
}
/**
 * Fills in the space between intervals with empty space.
 * This is necessary to do when saving to create a well-formed textgrid.
 * @ignore
 */
function fillInBlanks(tier, blankLabel, startTime, endTime) {
    if (blankLabel === void 0) { blankLabel = ''; }
    if (startTime === void 0) { startTime = null; }
    if (endTime === void 0) { endTime = null; }
    if (startTime === null)
        startTime = tier.minTimestamp;
    if (endTime === null)
        endTime = tier.maxTimestamp;
    // Special case: empty textgrid
    if (tier.entryList.length === 0)
        tier.entryList.push([startTime, endTime, blankLabel]);
    // Create a new entry list
    var entryList = tier.entryList.slice();
    var entry = entryList[0];
    var prevEnd = parseFloat(entry[1]);
    var newEntryList = [entry];
    for (var i = 1; i < entryList.length; i++) {
        var newStart = parseFloat(entryList[i][0]);
        var newEnd = parseFloat(entryList[i][1]);
        if (prevEnd < newStart)
            newEntryList.push([prevEnd, newStart, blankLabel]);
        newEntryList.push(entryList[i]);
        prevEnd = newEnd;
    }
    // Special case: If there is a gap at the start of the file
    if (parseFloat(newEntryList[0][0]) < parseFloat(startTime)) {
        throw new Error('Tier data is before the tier start time.');
    }
    if (parseFloat(newEntryList[0][0]) > parseFloat(startTime)) {
        newEntryList.splice(0, 0, [startTime, newEntryList[0][0], blankLabel]);
    }
    // Special case: If there is a gap at the end of the file
    if (endTime !== null) {
        var lastI = newEntryList.length - 1;
        if (parseFloat(newEntryList[lastI][1]) > parseFloat(endTime)) {
            throw new Error('Tier data is after the tier end time.');
        }
        if (parseFloat(newEntryList[lastI][1]) < parseFloat(endTime)) {
            newEntryList.push([newEntryList[lastI][1], endTime, blankLabel]);
        }
    }
    return (0, textgrid_js_1.copyTier)(tier, { entryList: newEntryList });
}
/**
 * Prints each entry in the tier on a separate line w/ timing info
 * @ignore
 */
function tierToText(tier) {
    var text = '';
    text += "\"".concat(tier.tierType, "\"\n");
    text += "\"".concat(tier.name, "\"\n");
    text += "".concat(tier.minTimestamp, "\n").concat(tier.maxTimestamp, "\n");
    text += "".concat(tier.entryList.length, "\n");
    for (var i = 0; i < tier.entryList.length; i++) {
        var entry = tier.entryList[i];
        entry = entry.map(function (val) { return "".concat(val); });
        var labelI = void 0;
        if (tier.tierType === textgrid_js_1.POINT_TIER) {
            labelI = 1;
        }
        else if (tier.tierType === textgrid_js_1.INTERVAL_TIER) {
            labelI = 2;
        }
        entry[labelI] = "\"".concat(entry[labelI], "\"");
        text += entry.join('\n') + '\n';
    }
    return text;
}
/**
 * Remove intervals that are very tiny
 * Doing many small manipulations on intervals can lead to the creation
 * of ultrashort intervals (e.g. 1*10^-15 seconds long).  This function
 * removes such intervals.
 * @ignore
 */
function removeUltrashortIntervals(tier, minLength, minTimestamp) {
    // First, remove tiny intervals
    var newEntryList = [];
    var j = 0;
    for (var i = 0; i < tier.entryList.length; i++) {
        var _a = tier.entryList[i], start = _a[0], stop_1 = _a[1], label = _a[2];
        if (stop_1 - start < minLength) {
            // Correct ultra-short entries
            if (newEntryList.length > 0) {
                newEntryList[j - 1] = (newEntryList[j - 1], stop_1, newEntryList[j - 1]);
            }
        }
        else {
            // Special case: the first entry in oldEntryList was ultra-short
            if (newEntryList.length === 0 && start !== minTimestamp) {
                newEntryList.push([minTimestamp, stop_1, label]);
            }
            else { // Normal case
                newEntryList.push([start, stop_1, label]);
            }
            j += 1;
        }
    }
    // Next, shift near equivalent tiny boundaries
    j = 0;
    while (j < newEntryList.length - 1) {
        var diff = Math.abs(newEntryList[j][1] - newEntryList[j + 1][0]);
        if (diff > 0 && diff < minLength) {
            newEntryList[j] = [newEntryList[j][0], newEntryList[j + 1][0], newEntryList[j][2]];
        }
        j += 1;
    }
    return (0, textgrid_js_1.copyTier)(tier, { entryList: newEntryList });
}
/**
 * Formats a textgrid instance for saving to a .csv file
 * @param {Textgrid} tg
 * @param {string} pivotTierName - One row in the output is listed for each entry in this tier.
 *  The corresponding entry in each tier will be provided on the same row
 *  along with the start and end time of the entry from the pivot tier.
 * @param {Array} [tierNameList=null] - the list of tier names to save.  If null, save all tiers.
 * @return {text}
 */
function serializeTextgridToCsv(tg, pivotTierName, tierNameList, includeHeader) {
    if (tierNameList === void 0) { tierNameList = null; }
    if (includeHeader === void 0) { includeHeader = true; }
    if (!tierNameList)
        tierNameList = tg.tierNameList;
    var table = [];
    if (includeHeader === true) {
        var colHeader = tierNameList.slice();
        colHeader.push('Start Time');
        colHeader.push('End Time');
        table.push(colHeader);
    }
    var tier = tg.tierDict[pivotTierName];
    for (var i = 0; i < tier.entryList.length; i++) {
        var start = tier.entryList[i][0];
        var stop_2 = tier.entryList[i][1];
        // let label = tier.entryList[i][2];
        var subTG = (0, textgrid_modifiers_js_1.cropTextgrid)(tg, start, stop_2, 'truncated', false);
        var row = [];
        for (var j = 0; j < tierNameList.length; j++) {
            var subLabel = '';
            if (subTG.tierNameList.includes(tierNameList[j])) {
                var subTier = subTG.tierDict[tierNameList[j]];
                if (subTier.entryList.length > 0) {
                    subLabel = subTier.entryList[0][2];
                }
            }
            row.push(subLabel);
        }
        row.push(start);
        row.push(stop_2);
        table.push(row);
    }
    table = table.map(function (row) { return row.join(','); });
    var csv = table.join('\n');
    return csv;
}
exports.serializeTextgridToCsv = serializeTextgridToCsv;
/**
 * Formats a textgrid instance for saving to a .TextGrid file.
 * @param {Textgrid} tg
 * @param {number} [minimumIntervalLength=MIN_INTERVAL_LENGTH] - remove all intervals shorter than this; if null, don't remove any intervals
 * @param {number} [minTimestamp = null] -- the minTimestamp of the saved Textgrid; if None, use whatever is defined in the Textgrid object.  If minTimestamp is larger than timestamps in your textgrid, an exception will be thrown.
 * @param {number} [maxTimestamp = null] -- the maxTimestamp of the saved Textgrid; if None, use whatever is defined in the Textgrid object.  If maxTimestamp is larger than timestamps in your textgrid, an exception will be thrown.
 * @param {boolean} [useShortForm = true] -- specifies whether to use the short or long form specification of a textgrid;  the long form is more human readable, the short form is more compact
 * @return A text representation of a textgrid that can be opened by Praat
 */
function serializeTextgrid(tg, minimumIntervalLength, minTimestamp, maxTimestamp, useShortForm) {
    if (minimumIntervalLength === void 0) { minimumIntervalLength = textgrid_js_1.MIN_INTERVAL_LENGTH; }
    if (minTimestamp === void 0) { minTimestamp = null; }
    if (maxTimestamp === void 0) { maxTimestamp = null; }
    if (useShortForm === void 0) { useShortForm = true; }
    if (minTimestamp === null)
        minTimestamp = tg.minTimestamp;
    if (maxTimestamp === null)
        maxTimestamp = tg.maxTimestamp;
    var outputTg = prepTgForSaving(tg, minimumIntervalLength, minTimestamp, maxTimestamp);
    var outputTxt = '';
    if (useShortForm) {
        outputTxt = tgToShortTextForm(outputTg, minTimestamp, maxTimestamp);
    }
    else {
        outputTxt = tgToLongTextForm(outputTg, minTimestamp, maxTimestamp);
    }
    return outputTxt;
}
exports.serializeTextgrid = serializeTextgrid;
function tgToShortTextForm(tg, minTimestamp, maxTimestamp) {
    var outputTxt = '';
    outputTxt += 'File type = "ooTextFile"\n';
    outputTxt += 'Object class = "TextGrid"\n\n';
    outputTxt += "".concat(minTimestamp, "\n").concat(maxTimestamp, "\n");
    outputTxt += "<exists>\n".concat(tg.tierNameList.length, "\n");
    for (var i = 0; i < tg.tierNameList.length; i++) {
        outputTxt += tierToText(tg.tierDict[tg.tierNameList[i]]);
    }
    return outputTxt;
}
function tgToLongTextForm(tg, minTimestamp, maxTimestamp) {
    var tab = ' '.repeat(4);
    var outputTxt = '';
    // File header
    outputTxt += 'File type = "ooTextFile"\n';
    outputTxt += 'Object class = "TextGrid"\n\n';
    outputTxt += "xmin = ".concat(minTimestamp, " \n");
    outputTxt += "xmax = ".concat(maxTimestamp, " \n");
    outputTxt += 'tiers? <exists> \n';
    outputTxt += "size = ".concat(tg.tierNameList.length, " \n");
    outputTxt += 'item []: \n';
    for (var i = 0; i < tg.tierNameList.length; i++) {
        var tierName = tg.tierNameList[i];
        var tier = tg.tierDict[tierName];
        // Interval header
        outputTxt += tab + "item [".concat(i + 1, "]:\n");
        outputTxt += tab.repeat(2) + "class = \"".concat(tier.tierType, "\" \n");
        outputTxt += tab.repeat(2) + "name = \"".concat(tierName, "\" \n");
        outputTxt += tab.repeat(2) + "xmin = ".concat(minTimestamp, " \n");
        outputTxt += tab.repeat(2) + "xmax = ".concat(maxTimestamp, " \n");
        if (tier.tierType === textgrid_js_1.INTERVAL_TIER) {
            outputTxt += tab.repeat(2) + "intervals: size = ".concat(tier.entryList.length, " \n");
            for (var j = 0; j < tier.entryList.length; j++) {
                var _a = tier.entryList[j], start = _a[0], stop_3 = _a[1], label = _a[2];
                outputTxt += tab.repeat(2) + "intervals [".concat(j + 1, "]:\n");
                outputTxt += tab.repeat(3) + "xmin = ".concat(start, " \n");
                outputTxt += tab.repeat(3) + "xmax = ".concat(stop_3, " \n");
                outputTxt += tab.repeat(3) + "text = \"".concat(label, "\" \n");
            }
        }
        else {
            outputTxt += tab.repeat(2) + "points: size = ".concat(tier.entryList.length, " \n");
            for (var j = 0; j < tier.entryList.length; j++) {
                var _b = tier.entryList[j], timestamp = _b[0], label = _b[1];
                outputTxt += tab.repeat(2) + "points [".concat(j + 1, "]:\n");
                outputTxt += tab.repeat(3) + "number = ".concat(timestamp, " \n");
                outputTxt += tab.repeat(3) + "mark = \"".concat(label, "\" \n");
            }
        }
    }
    return outputTxt;
}
/**
 * Processing done before every textgrid is saved (serializeTextgrid calls this function) -- gaps are filled with silence and short intervals can be removed
 * @param {Textgrid} tg
 * @param {number} [minimumIntervalLength=MIN_INTERVAL_LENGTH] - remove all intervals shorter than this; if null, don't remove any intervals
 * @param {number} [minTimestamp = null] -- the minTimestamp of the saved Textgrid; if None, use whatever is defined in the Textgrid object.  If minTimestamp is larger than timestamps in your textgrid, an exception will be thrown.
 * @param {number} [maxTimestamp = null] -- the maxTimestamp of the saved Textgrid; if None, use whatever is defined in the Textgrid object.  If maxTimestamp is larger than timestamps in your textgrid, an exception will be thrown.
 * @return A cleaned TextGrid
 */
function prepTgForSaving(tg, minimumIntervalLength, minTimestamp, maxTimestamp) {
    if (minimumIntervalLength === void 0) { minimumIntervalLength = textgrid_js_1.MIN_INTERVAL_LENGTH; }
    if (minTimestamp === void 0) { minTimestamp = null; }
    if (maxTimestamp === void 0) { maxTimestamp = null; }
    if (minTimestamp === null)
        minTimestamp = tg.minTimestamp;
    if (maxTimestamp === null)
        maxTimestamp = tg.maxTimestamp;
    for (var i = 0; i < tg.tierNameList.length; i++) {
        tg.tierDict[tg.tierNameList[i]].sort();
    }
    // Fill in the blank spaces for interval tiers
    for (var i = 0; i < tg.tierNameList.length; i++) {
        var tierName = tg.tierNameList[i];
        var tier = tg.tierDict[tierName];
        if (tier instanceof textgrid_js_1.IntervalTier) {
            tier = fillInBlanks(tier, '', minTimestamp, maxTimestamp);
            if (minimumIntervalLength !== null) {
                tier = removeUltrashortIntervals(tier, minimumIntervalLength, minTimestamp);
            }
            tg.tierDict[tierName] = tier;
        }
    }
    for (var i = 0; i < tg.tierNameList.length; i++) {
        tg.tierDict[tg.tierNameList[i]].sort();
    }
    return tg;
}
exports.prepTgForSaving = prepTgForSaving;
/**
 * Creates an instance of a Textgrid from the contents of a .Textgrid file.
 * @param {Buffer|string} text - can be either a buffer or a raw text string
 * @param {boolean} readRaw - default false; if true, points and intervals with an empty label '' are removed
 * @return {Textgrid}
 */
function parseTextgrid(text, readRaw) {
    if (readRaw === void 0) { readRaw = false; }
    text = decodeBuffer(text);
    text = text.replace(/\r\n/g, '\n');
    var textgrid;
    var caseA = text.indexOf('ooTextFile short') > -1; // 'short' in header
    var caseB = text.indexOf('item [') === -1; // 'item' keyword not in file
    if (caseA || caseB) {
        textgrid = parseShortTextgrid(text);
    }
    else {
        textgrid = parseNormalTextgrid(text);
    }
    if (readRaw === false) {
        for (var i = 0; i < textgrid.tierNameList.length; i++) {
            var tierName = textgrid.tierNameList[i];
            var tier = removeBlanks(textgrid.tierDict[tierName]);
            textgrid.replaceTier(tierName, tier);
        }
    }
    return textgrid;
}
exports.parseTextgrid = parseTextgrid;
function removeBlanks(tier) {
    var entryList = [];
    for (var i = 0; i < tier.entryList.length; i++) {
        var entry = tier.entryList[i];
        if (entry[entry.length - 1] === '') {
            continue;
        }
        entryList.push(entry);
    }
    return (0, textgrid_js_1.copyTier)(tier, { entryList: entryList });
}
/**
 * Decodes a buffer from utf16/8 to text.
 * @param {Buffer} buffer - if not of type Buffer, it will be returned without modification.
 * @return {string}
 * @ignore
 */
function decodeBuffer(buffer) {
    var returnText = buffer;
    if (Buffer.isBuffer(buffer)) {
        var decodedText = iconvlite.decode(buffer, 'utf16');
        if (decodedText.indexOf('ooTextFile') === -1) {
            decodedText = iconvlite.decode(buffer, 'utf8');
        }
        returnText = decodedText;
    }
    return returnText;
}
exports.decodeBuffer = decodeBuffer;

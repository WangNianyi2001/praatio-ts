import * as iconvlite from 'iconv-lite';
import { TextGrid, IntervalTier, PointTier, copyTier, } from './textgrid';
import { cropTextgrid } from './textgrid_modifiers';
function split(str, separator, max = 0) {
    const out = [];
    let index = 0;
    let next;
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
    const indexList = [];
    let index = sourceStr.indexOf(subStr);
    while (index !== -1) {
        indexList.push(index);
        index += 1;
        index = sourceStr.indexOf(subStr, index);
    }
    return indexList;
}
function fetchRow(dataStr, searchStr, index) {
    const startIndex = dataStr.indexOf(searchStr, index) + searchStr.length;
    let endIndex = dataStr.indexOf('\n', startIndex);
    let word = dataStr.substring(startIndex, endIndex);
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
    // Toss header
    const tierList = data.split('item [');
    const textgridHeader = tierList.shift();
    const tgMin = +textgridHeader.split('xmin = ', 2[1].split('\n', 1)[0].trim());
    const tgMax = +textgridHeader.split('xmax = ', 2[1].split('\n', 1)[0].trim());
    // Process each tier individually
    // tierList = data.split('item');
    // tierList = tierList[1,tierList.length];
    let tierTxt = '';
    tierList.shift(); // Removing the document root empty item
    const textgrid = new TextGrid();
    textgrid.minTimestamp = tgMin;
    textgrid.maxTimestamp = tgMax;
    for (let i = 0; i < tierList.length; i++) {
        tierTxt = tierList[i];
        // Get tier type
        let searchWord = 'points';
        if (tierTxt.indexOf('class = "IntervalTier"') > -1) {
            searchWord = 'intervals';
        }
        // Get tier meta-information
        const tmpArray = split(tierTxt, searchWord + ':', 2);
        const header = tmpArray[0];
        const tierData = tmpArray[1];
        let tierName = header.split('name = ', 2)[1].split('\n', 1)[0].trim();
        tierName = tierName.slice(1, tierName.length - 1); // remove quotes
        const tierStart = +header.split('xmin = ', 2)[1].split('\n', 1)[0].trim();
        const tierEnd = +header.split('xmax = ', 2)[1].split('\n', 1)[0].trim();
        // Get the tier entry list
        const entryList = [];
        let labelI = 0;
        let label = null;
        let tier = null;
        switch (true) {
            case tier instanceof IntervalTier:
                let timeStartI = null;
                let timeEndI = null;
                let timeStart = null;
                let timeEnd = null;
                while (true) {
                    [timeStart, timeStartI] = fetchRow(tierData, 'xmin = ', labelI);
                    // Break condition here.  indexof loops around at the end of a file
                    if (timeStartI <= labelI)
                        break;
                    [timeEnd, timeEndI] = fetchRow(tierData, 'xmax = ', timeStartI);
                    [label, labelI] = fetchRow(tierData, 'text =', timeEndI);
                    label = label.trim();
                    entryList.push([timeStart, timeEnd, label]);
                }
                tier = new IntervalTier(tierName, entryList, tierStart, tierEnd);
                break;
            case tier instanceof PointTier:
                let timePointI = null;
                let timePoint = null;
                while (true) {
                    [timePoint, timePointI] = fetchRow(tierData, 'number = ', labelI);
                    // Break condition here.  indexof loops around at the end of a file
                    if (timePointI <= labelI)
                        break;
                    [label, labelI] = fetchRow(tierData, 'mark =', timePointI);
                    label = label.trim();
                    entryList.push([timePoint, label]);
                }
                tier = new PointTier(tierName, entryList, tierStart, tierEnd);
                break;
        }
        textgrid.addTier(tier);
    }
    return textgrid;
}
function parseShortTextgrid(data) {
    const indexList = [];
    const intervalIndicies = findAllSubstrings(data, '"IntervalTier"');
    for (let i = 0; i < intervalIndicies.length; i++) {
        indexList.push([intervalIndicies[i], true]);
    }
    const pointIndicies = findAllSubstrings(data, '"TextTier"');
    for (let i = 0; i < pointIndicies.length; i++) {
        indexList.push([pointIndicies[i], false]);
    }
    indexList.push([data.length, null]); // The 'end' of the file
    indexList.sort(function (x, y) {
        return x[0] - y[0];
    });
    const tupleList = [];
    for (let i = 0; i < indexList.length - 1; i++) {
        tupleList.push([indexList[i][0], indexList[i + 1][0], indexList[i][1]]);
    }
    // Set the textgrid's min and max times
    const header = data.slice(0, tupleList[0][0]);
    const headerList = header.split('\n');
    const tgMin = +headerList[3];
    const tgMax = +headerList[4];
    // Add the textgrid tiers
    const textgrid = new TextGrid();
    textgrid.minTimestamp = tgMin;
    textgrid.maxTimestamp = tgMax;
    for (let i = 0; i < tupleList.length; i++) {
        let tier = null;
        const blockStartI = tupleList[i][0];
        const blockEndI = tupleList[i][1];
        const isInterval = tupleList[i][2];
        const tierData = data.slice(blockStartI, blockEndI);
        const metaStartI = fetchRow(tierData, '', 0)[1];
        // Tier meta-information
        const [tierName, tierNameEndI] = fetchRow(tierData, '', metaStartI);
        let [tierStartTime, tierStartTimeI] = fetchRow(tierData, '', tierNameEndI).map(_ => +_);
        let [tierEndTime, tierEndTimeI] = fetchRow(tierData, '', tierStartTimeI).map(_ => +_);
        let startTimeI = fetchRow(tierData, '', tierEndTimeI)[1];
        // Tier entry data
        let startTime = null;
        let endTime = null;
        let label = null;
        // let tierType = null;
        let endTimeI = null;
        let labelI = null;
        const entryList = [];
        if (isInterval === true) {
            while (true) {
                [startTime, endTimeI] = fetchRow(tierData, '', startTimeI);
                if (endTimeI === -1)
                    break;
                [endTime, labelI] = fetchRow(tierData, '', endTimeI);
                [label, startTimeI] = fetchRow(tierData, '', labelI);
                label = label.trim();
                entryList.push([startTime, endTime, label]);
            }
            tier = new IntervalTier(tierName, entryList, tierStartTime, tierEndTime);
        }
        else {
            while (true) {
                [startTime, labelI] = fetchRow(tierData, '', startTimeI);
                if (labelI === -1)
                    break;
                [label, startTimeI] = fetchRow(tierData, '', labelI);
                label = label.trim();
                entryList.push([startTime, label]);
            }
            tier = new PointTier(tierName, entryList, tierStartTime, tierEndTime);
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
function fillInBlanks(tier, blankLabel = '') {
    let startTime = tier.minTimestamp, endTime = tier.maxTimestamp;
    // Special case: empty textgrid
    if (tier.entryList.length === 0)
        tier.entryList.push([startTime, endTime, blankLabel]);
    // Create a new entry list
    const entryList = tier.entryList.slice();
    const entry = entryList[0];
    let prevEnd = entry[1];
    const newEntryList = [entry];
    for (let i = 1; i < entryList.length; i++) {
        const newStart = entryList[i][0];
        const newEnd = entryList[i][1];
        if (prevEnd < newStart)
            newEntryList.push([prevEnd, newStart, blankLabel]);
        newEntryList.push(entryList[i]);
        prevEnd = newEnd;
    }
    // Special case: If there is a gap at the start of the file
    if (newEntryList[0][0] < startTime) {
        throw new Error('Tier data is before the tier start time.');
    }
    if (newEntryList[0][0] > startTime) {
        newEntryList.splice(0, 0, [startTime, newEntryList[0][0], blankLabel]);
    }
    // Special case: If there is a gap at the end of the file
    if (endTime !== null) {
        const lastI = newEntryList.length - 1;
        if (newEntryList[lastI][1] > endTime) {
            throw new Error('Tier data is after the tier end time.');
        }
        if (newEntryList[lastI][1] < endTime) {
            newEntryList.push([newEntryList[lastI][1], endTime, blankLabel]);
        }
    }
    return copyTier(tier, { entryList: newEntryList });
}
function tierToText(tier) {
    let text = '';
    text += `"${tier.name}"\n`;
    text += `${tier.minTimestamp}\n${tier.maxTimestamp}\n`;
    text += `${tier.entryList.length}\n`;
    for (let i = 0; i < tier.entryList.length; i++) {
        let entry = tier.entryList[i];
        text += entry.join('\n') + '\n';
    }
    return text;
}
/**
 * Formats a textgrid instance for saving to a .csv file
 * @param {TextGrid} tg
 * @param {string} pivotTierName - One row in the output is listed for each entry in this tier.
 *  The corresponding entry in each tier will be provided on the same row
 *  along with the start and end time of the entry from the pivot tier.
 * @param {Array} [tierNameList=null] - the list of tier names to save.  If null, save all tiers.
 * @return {text}
 */
function serializeTextgridToCsv(tg, pivotTierName, tierNameList = null, includeHeader = true) {
    if (!tierNameList)
        tierNameList = tg.tierNameList;
    let table = [];
    if (includeHeader === true) {
        const colHeader = tierNameList.slice();
        colHeader.push('Start Time');
        colHeader.push('End Time');
        table.push(colHeader);
    }
    const tier = tg.tierDict[pivotTierName];
    for (let i = 0; i < tier.entryList.length; i++) {
        const start = tier.entryList[i][0];
        const stop = tier.entryList[i][1];
        // let label = tier.entryList[i][2];
        const subTG = cropTextgrid(tg, start, stop, 'truncated', false);
        const row = [];
        for (let j = 0; j < tierNameList.length; j++) {
            let subLabel = '';
            if (subTG.tierNameList.includes(tierNameList[j])) {
                const subTier = subTG.tierDict[tierNameList[j]];
                if (subTier.entryList.length > 0) {
                    subLabel = subTier.entryList[0][2];
                }
            }
            row.push(subLabel);
        }
        row.push(start);
        row.push(stop);
        table.push(row);
    }
    table = table.map(row => row.join(','));
    const csv = table.join('\n');
    return csv;
}
/**
 * Formats a textgrid instance for saving to a .TextGrid file.
 * @param {TextGrid} tg
 * @param {number} [minTimestamp = null] -- the minTimestamp of the saved Textgrid; if None, use whatever is defined in the Textgrid object.  If minTimestamp is larger than timestamps in your textgrid, an exception will be thrown.
 * @param {number} [maxTimestamp = null] -- the maxTimestamp of the saved Textgrid; if None, use whatever is defined in the Textgrid object.  If maxTimestamp is larger than timestamps in your textgrid, an exception will be thrown.
 * @param {boolean} [useShortForm = true] -- specifies whether to use the short or long form specification of a textgrid;  the long form is more human readable, the short form is more compact
 * @return A text representation of a textgrid that can be opened by Praat
 */
function serializeTextgrid(tg) {
    return [
        'File type = "ooTextFile"',
        'Object class = "TextGrid"\n',
        `${tg.minTimestamp}\n${tg.maxTimestamp}`,
        `<exists>\n${tg.tierNameList.length}`,
        tg.tierNameList.map(name => tierToText(tg.tierDict[name])),
    ].join('\n');
}
/**
 * Processing done before every textgrid is saved (serializeTextgrid calls this function) -- gaps are filled with silence and short intervals can be removed
 * @param {TextGrid} tg
 */
function prepTgForSaving(tg) {
    for (let i = 0; i < tg.tierNameList.length; i++) {
        tg.tierDict[tg.tierNameList[i]].sort();
    }
    // Fill in the blank spaces for interval tiers
    for (let i = 0; i < tg.tierNameList.length; i++) {
        const tierName = tg.tierNameList[i];
        let tier = tg.tierDict[tierName];
        if (tier instanceof IntervalTier) {
            tier = fillInBlanks(tier);
            tg.tierDict[tierName] = tier;
        }
    }
    for (let i = 0; i < tg.tierNameList.length; i++) {
        tg.tierDict[tg.tierNameList[i]].sort();
    }
    return tg;
}
/**
 * Creates an instance of a Textgrid from the contents of a .Textgrid file.
 * @param {Buffer|string} text - can be either a buffer or a raw text string
 * @param {boolean} readRaw - default false; if true, points and intervals with an empty label '' are removed
 * @return {TextGrid}
 */
function parseTextgrid(text, readRaw = false) {
    text = decodeBuffer(text);
    text = text.replace(/\r\n/g, '\n');
    let textgrid;
    const caseA = text.indexOf('ooTextFile short') > -1; // 'short' in header
    const caseB = text.indexOf('item [') === -1; // 'item' keyword not in file
    if (caseA || caseB) {
        textgrid = parseShortTextgrid(text);
    }
    else {
        textgrid = parseNormalTextgrid(text);
    }
    if (readRaw === false) {
        for (let i = 0; i < textgrid.tierNameList.length; i++) {
            const tierName = textgrid.tierNameList[i];
            const tier = removeBlanks(textgrid.tierDict[tierName]);
            textgrid.replaceTier(tierName, tier);
        }
    }
    return textgrid;
}
function removeBlanks(tier) {
    const entryList = [];
    for (let i = 0; i < tier.entryList.length; i++) {
        const entry = tier.entryList[i];
        if (entry[entry.length - 1] === '') {
            continue;
        }
        entryList.push(entry);
    }
    return copyTier(tier, { entryList: entryList });
}
/**
 * Decodes a buffer from utf16/8 to text.
 * @param {Buffer} buffer - if not of type Buffer, it will be returned without modification.
 * @return {string}
 * @ignore
 */
function decodeBuffer(buffer) {
    let returnText = buffer;
    if (Buffer.isBuffer(buffer)) {
        let decodedText = iconvlite.decode(buffer, 'utf16');
        if (decodedText.indexOf('ooTextFile') === -1) {
            decodedText = iconvlite.decode(buffer, 'utf8');
        }
        returnText = decodedText;
    }
    return returnText;
}
export { parseTextgrid, serializeTextgrid, serializeTextgridToCsv, decodeBuffer, prepTgForSaving };

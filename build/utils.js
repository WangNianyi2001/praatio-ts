import TextGrid from './textgrid.js';
import { IntervalTier } from './tiers/interval.js';
import { PointTier } from './tiers/point.js';
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
    tierList.shift();
    // Process each tier individually
    // tierList = data.split('item');
    // tierList = tierList[1,tierList.length];
    let tierTxt = '';
    tierList.shift(); // Removing the document root empty item
    const textgrid = new TextGrid();
    for (let i = 0; i < tierList.length; i++) {
        tierTxt = tierList[i];
        // Get tier type
        const searchWord = tierTxt.indexOf('class = "IntervalTier"') > -1 ? 'intervals' : 'points';
        // Get tier meta-information
        const tmpArray = split(tierTxt, searchWord + ':', 2);
        const header = tmpArray[0];
        const tierData = tmpArray[1];
        const tierName = header.split('name = ', 2)[1]
            .split('\n', 1)[0]
            .trim()
            .slice(1, -1);
        const tierType = header.split('class = ', 2)[1]
            .split('\n', 1)[0]
            .trim()
            .slice(1, -1);
        // Get the tier entry list
        const denotations = [];
        let labelI = 0;
        let label = null;
        let tier = null;
        switch (tierType) {
            default:
                console.error(header);
                throw 'Auuugh no';
            case 'IntervalTier':
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
                    denotations.push([timeStart, timeEnd, label]);
                }
                tier = new IntervalTier(tierName, denotations);
                break;
            case 'PointTier':
                let timePointI = null;
                let timePoint = null;
                while (true) {
                    [timePoint, timePointI] = fetchRow(tierData, 'number = ', labelI);
                    // Break condition here.  indexof loops around at the end of a file
                    if (timePointI <= labelI)
                        break;
                    [label, labelI] = fetchRow(tierData, 'mark =', timePointI);
                    label = label.trim();
                    denotations.push([timePoint, label]);
                }
                tier = new PointTier(tierName, denotations);
                break;
        }
        textgrid.Add(tier);
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
    // Add the textgrid tiers
    const textgrid = new TextGrid();
    for (let i = 0; i < tupleList.length; i++) {
        let tier = null;
        const blockStartI = tupleList[i][0];
        const blockEndI = tupleList[i][1];
        const isInterval = tupleList[i][2];
        const tierData = data.slice(blockStartI, blockEndI);
        const metaStartI = fetchRow(tierData, '', 0)[1];
        // Tier meta-information
        const [tierName, tierNameEndI] = fetchRow(tierData, '', metaStartI);
        let [, tierStartTimeI] = fetchRow(tierData, '', tierNameEndI).map(_ => +_);
        let [, tierEndTimeI] = fetchRow(tierData, '', tierStartTimeI).map(_ => +_);
        let startTimeI = fetchRow(tierData, '', tierEndTimeI)[1];
        // Tier entry data
        let startTime = null;
        let endTime = null;
        let label = null;
        // let tierType = null;
        let endTimeI = null;
        let labelI = null;
        const denotations = [];
        if (isInterval) {
            while (true) {
                [startTime, endTimeI] = fetchRow(tierData, '', startTimeI);
                if (endTimeI === -1)
                    break;
                [endTime, labelI] = fetchRow(tierData, '', endTimeI);
                [label, startTimeI] = fetchRow(tierData, '', labelI);
                label = label.trim();
                denotations.push([startTime, endTime, label]);
            }
            tier = new IntervalTier(tierName, denotations);
        }
        else {
            while (true) {
                [startTime, labelI] = fetchRow(tierData, '', startTimeI);
                if (labelI === -1)
                    break;
                [label, startTimeI] = fetchRow(tierData, '', labelI);
                label = label.trim();
                denotations.push([startTime, label]);
            }
            tier = new PointTier(tierName, denotations);
        }
        textgrid.Add(tier);
    }
    return textgrid;
}
function tierToText(tier) {
    let text = '';
    text += `"${tier.name}"\n`;
    text += `${tier.start}\n${tier.end}\n`;
    text += `${tier.denotations.length}\n`;
    for (let i = 0; i < tier.denotations.length; i++) {
        let entry = tier.denotations[i];
        text += entry.join('\n') + '\n';
    }
    return text;
}
function serializeTextgrid(tg) {
    return [
        'File type = "ooTextFile"',
        'Object class = "TextGrid"\n',
        `${tg.start}\n${tg.end}`,
        `<exists>\n${tg.tierNames.length}`,
        tg.tierNames.map(name => tierToText(tg.tierDict.get(name))),
    ].join('\n');
}
function parseTextgrid(text) {
    text = text.replace(/\r\n/g, '\n');
    let textgrid;
    const caseA = text.indexOf('ooTextFile short') > -1; // 'short' in header
    const caseB = text.indexOf('item [') === -1; // 'item' keyword not in file
    return (caseA || caseB ? parseShortTextgrid : parseNormalTextgrid)(text);
}
export { parseTextgrid, serializeTextgrid };

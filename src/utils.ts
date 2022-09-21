import TextGrid from './textgrid.js';
import { Interval, IntervalTier } from './tiers/interval.js';
import { Point, PointTier } from './tiers/point.js';

function split(str: string, separator: string, max: number = 0): string[] {
	const out = [];
	let index = 0;
	let next;

	if(max) {
		while(out.length < max - 1) {
			next = str.indexOf(separator, index);
			if(next === -1) {
				break;
			}
			out.push(str.substring(index, next));
			index = next + separator.length;
		}
	}
	out.push(str.substring(index));
	return out;
}

function findAllSubstrings(sourceStr: string, subStr: string): string[] {
	const indexList = [];
	let index = sourceStr.indexOf(subStr);
	while(index !== -1) {
		indexList.push(index);
		index += 1;

		index = sourceStr.indexOf(subStr, index);
	}
	return indexList;
}

function fetchRow(dataStr: string, searchStr: string, index: number): [string, number] {
	const startIndex = dataStr.indexOf(searchStr, index) + searchStr.length;
	let endIndex = dataStr.indexOf('\n', startIndex);

	let word = dataStr.substring(startIndex, endIndex);
	word = word.trim();

	if(word[0] === '"' && word[word.length - 1] === '"') {
		word = word.substring(1, word.length - 1);
	}
	word = word.trim();

	// Increment the index by 1, unless nothing was found
	if(endIndex !== -1) endIndex += 1;

	return [word, endIndex];
}

function parseNormalTextgrid(data: string): TextGrid | null {
	// Toss header
	const tierList = data.split('item [');
	tierList.shift();

	// Process each tier individually
	// tierList = data.split('item');
	// tierList = tierList[1,tierList.length];
	let tierTxt = '';
	tierList.shift(); // Removing the document root empty item
	const textgrid = new TextGrid();

	for(let i = 0; i < tierList.length; i++) {
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
		let labelI = 0;
		let label = null;
		let tier = null;
		switch(tierType) {
			default:
				console.error(`Unsupported tier type ${tierType}`);
			case 'IntervalTier': {
				let timeStartI = null;
				let timeEndI = null;
				let timeStart = null;
				let timeEnd = null;
				const intervals = [];
				while(true) {
					[timeStart, timeStartI] = fetchRow(tierData, 'xmin = ', labelI);

					// Break condition here.  indexof loops around at the end of a file
					if(timeStartI <= labelI)
					break;

					[timeEnd, timeEndI] = fetchRow(tierData, 'xmax = ', timeStartI);
					[label, labelI] = fetchRow(tierData, 'text =', timeEndI);

					label = label.trim();
					intervals.push(new Interval(label, +timeStart, +timeEnd));
				}
				tier = new IntervalTier(tierName, intervals);
				break;
			}
			case 'PointTier': {
				let timePointI = null;
				let timePoint = null;
				const points = [];
				while(true) {
					[timePoint, timePointI] = fetchRow(tierData, 'number = ', labelI);

					// Break condition here.  indexof loops around at the end of a file
					if(timePointI <= labelI)
						break;

					[label, labelI] = fetchRow(tierData, 'mark =', timePointI);

					label = label.trim();
					points.push(new Point(label, +timePoint));
				}
				tier = new PointTier(tierName, points);
				break;
			}
		}
		textgrid.Add(tier);
	}
	return textgrid;
}

function parseShortTextgrid(data: string): TextGrid | null {
	const indexList = [];

	const intervalIndicies = findAllSubstrings(data, '"IntervalTier"');
	for(let i = 0; i < intervalIndicies.length; i++) {
		indexList.push([intervalIndicies[i], true]);
	}

	const pointIndicies = findAllSubstrings(data, '"TextTier"');
	for(let i = 0; i < pointIndicies.length; i++) {
		indexList.push([pointIndicies[i], false]);
	}

	indexList.push([data.length, null]); // The 'end' of the file
	indexList.sort(function(x, y) {
		return x[0] - y[0];
	});

	const tupleList = [];
	for(let i = 0; i < indexList.length - 1; ++i) {
		tupleList.push([indexList[i][0], indexList[i + 1][0], indexList[i][1]]);
	}

	// Add the textgrid tiers
	const textgrid = new TextGrid();

	for(let i = 0; i < tupleList.length; i++) {
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
		if(isInterval) {
			while(true) {
				[startTime, endTimeI] = fetchRow(tierData, '', startTimeI);
				if(endTimeI === -1) break;

				[endTime, labelI] = fetchRow(tierData, '', endTimeI);
				[label, startTimeI] = fetchRow(tierData, '', labelI);

				label = label.trim();
				denotations.push([startTime, endTime, label]);
			}
			tier = new IntervalTier(tierName, denotations);
		} else {
			while(true) {
				[startTime, labelI] = fetchRow(tierData, '', startTimeI);
				if(labelI === -1) break;

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

function serializeTextgrid(tg: TextGrid): string {
	const tab = '\t';

	let outputTxt = '';

	// File header
	outputTxt += 'File type = "ooTextFile"\n';
	outputTxt += 'Object class = "TextGrid"\n\n';
	outputTxt += `xmin = ${0} \n`;
	outputTxt += `xmax = ${tg.span} \n`;
	outputTxt += 'tiers? <exists> \n';
	outputTxt += `size = ${tg.tiers.size} \n`;
	outputTxt += 'item []: \n';

	let i = 0;
	for(const tier of tg.tiers.values()) {
		// Interval header
		outputTxt += tab + `item [${++i}]:\n`;
		outputTxt += tab.repeat(2) + `class = "${tier.constructor.name}" \n`;
		outputTxt += tab.repeat(2) + `name = "${tier.name}" \n`;
		outputTxt += tab.repeat(2) + `xmin = ${0} \n`;
		outputTxt += tab.repeat(2) + `xmax = ${tg.span} \n`;

		switch(true) {
			case tier instanceof IntervalTier:
				outputTxt += tab.repeat(2) + `intervals: size = ${tier.ranges.length} \n`;
				for(let j = 0; j < tier.ranges.length; j++) {
					const { start, end, label } = tier.ranges[j] as Interval;
					outputTxt += tab.repeat(2) + `intervals [${j + 1}]:\n`;
					outputTxt += tab.repeat(3) + `xmin = ${start} \n`;
					outputTxt += tab.repeat(3) + `xmax = ${end} \n`;
					outputTxt += tab.repeat(3) + `text = "${label}" \n`;
				}
				break;
			case tier instanceof PointTier:
				outputTxt += tab.repeat(2) + `points: size = ${tier.ranges.length} \n`;
				for(let j = 0; j < tier.ranges.length; j++) {
					const { time, label } = tier.ranges[j] as Point;
					outputTxt += tab.repeat(2) + `points [${j + 1}]:\n`;
					outputTxt += tab.repeat(3) + `number = ${time} \n`;
					outputTxt += tab.repeat(3) + `mark = "${label}" \n`;
				}
				break;
		}
	}

	return outputTxt;
}

function parseTextgrid(text: string): TextGrid | null {
	text = text.replace(/\r\n/g, '\n');
	const caseA = text.indexOf('ooTextFile short') > -1; // 'short' in header
	const caseB = text.indexOf('item [') === -1; // 'item' keyword not in file
	return (caseA || caseB ? parseShortTextgrid : parseNormalTextgrid)(text);
}

export { parseTextgrid, serializeTextgrid };

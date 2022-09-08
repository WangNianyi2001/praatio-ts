export class TierExistsException extends Error {
	readonly tierName: string;

	constructor(tierName, ...args) {
		super(...args);
		this.tierName = tierName;
		this.message = `Tier name ${tierName} already exists in textgrid`;
	}
};

export class TierCreationException extends Error {
	readonly errStr: string

	constructor(errStr, ...args) {
		super(...args);
		this.errStr = errStr;
		this.message = "Couldn't create tier: " + errStr;
	}
};

export class TextgridCollisionException extends Error {
	readonly tierName: string;
	entry: any;
	matchList: any;

	constructor(tierName, entry, matchList, ...args) {
		super(...args);
		this.tierName = tierName;
		this.entry = entry;
		this.matchList = matchList;
		this.message = `Attempted to insert interval [${entry}] into tier '${tierName}' of textgrid but overlapping entries [${matchList}] already exist.`;
	}
};

export class IndexException extends Error {
	indexVal: number;
	listLength: number;

	constructor(indexVal, listLength, ...args) {
		super(...args);
		this.indexVal = indexVal;
		this.listLength = listLength;
		this.message = `Attempted to index a list of length ${listLength} with index ${indexVal}.`;
	}
};

export class NonMatchingTiersException extends Error { };

export class OvershootModificationException extends Error {
	tierName: string;
	oldEntry: any;
	newEntry: any;
	min: number;
	max: number;

	constructor(tierName, oldEntry, newEntry, min, max, ...args) {
		super(...args);
		this.tierName = tierName;
		this.oldEntry = oldEntry;
		this.newEntry = newEntry;
		this.min = min;
		this.max = max;
		this.message = `Attempted to change [${oldEntry}] to [${newEntry}] in tier '${tierName}' however, this exceeds the bounds (${min},${max}).`;
	}
};

export class IncorrectArgumentException extends Error {
	value: any;
	targetValueList: any[];

	constructor(value, targetValueList, ...args) {
		super(...args);
		this.value = value;
		this.targetValueList = targetValueList;
		this.message = `Expected value '${this.value}' to be one value in [${this.targetValueList}].`
	}
}
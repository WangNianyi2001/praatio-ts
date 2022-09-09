export class OvershootModificationException extends Error {
    tierName;
    oldEntry;
    newEntry;
    min;
    max;
    constructor(tierName, oldEntry, newEntry, min, max, ...args) {
        super(...args);
        this.tierName = tierName;
        this.oldEntry = oldEntry;
        this.newEntry = newEntry;
        this.min = min;
        this.max = max;
        this.message = `Attempted to change [${oldEntry}] to [${newEntry}] in tier '${tierName}' however, this exceeds the bounds (${min},${max}).`;
    }
}
;
export class IncorrectArgumentException extends Error {
    value;
    targetValueList;
    constructor(value, targetValueList, ...args) {
        super(...args);
        this.value = value;
        this.targetValueList = targetValueList;
        this.message = `Expected value '${this.value}' to be one value in [${this.targetValueList}].`;
    }
}

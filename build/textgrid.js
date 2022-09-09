import { parseTextgrid, serializeTextgrid } from './utils.js';
export default class TextGrid {
    tierDict = new Map();
    get start() { return 0; }
    get end() {
        return Math.max(0, ...this.tiers.map(tier => tier.denotations.span));
    }
    get tiers() { return [...this.tierDict.values()]; }
    get tierNames() { return this.tiers.map(tier => tier.name); }
    static FromString(str) {
        return parseTextgrid(str);
    }
    static async FromBlob(blob) {
        return TextGrid.FromString(await blob.text());
    }
    static FromFile(stream) {
        return TextGrid.FromString(stream.read());
    }
    Serialize() {
        return serializeTextgrid(this);
    }
    Add(tier) {
        if (this.tierDict.has(tier.name)) {
            console.warn(`Tier "${tier.name}" already exists, skipping adding new tier`);
            return;
        }
        this.tierDict.set(tier.name, tier);
        tier.textgrid = this;
    }
}

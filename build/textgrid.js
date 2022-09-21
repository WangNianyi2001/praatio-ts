import { parseTextgrid, serializeTextgrid } from './utils.js';
export default class TextGrid {
    tiers = new Map();
    get span() {
        return Math.max(0, ...[...this.tiers.values()].map(tier => tier.ranges.span));
    }
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
    Add(tier, force = false) {
        if (!force && this.tiers.has(tier.name))
            return false;
        this.tiers.set(tier.name, tier);
        tier.textgrid = this;
        return true;
    }
}

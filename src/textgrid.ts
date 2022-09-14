import Tier from './tier.js';
import { Readable } from 'stream';
import { parseTextgrid, serializeTextgrid } from './utils.js';
import { IRange } from './range.js';

export default class TextGrid {
	tierDict = new Map<string, Tier<IRange<any>>>();

	get span(): number {
		return Math.max(0, ...this.tiers.map(tier => tier.denotations.span));
	}

	get tiers() { return [...this.tierDict.values()]; }
	get tierNames() { return this.tiers.map(tier => tier.name); }

	static FromString(str: string): TextGrid | null {
		return parseTextgrid(str);
	}
	static async FromBlob(blob: Blob): Promise<TextGrid | null> {
		return TextGrid.FromString(await blob.text());
	}
	static FromFile(stream: Readable): TextGrid | null {
		return TextGrid.FromString(stream.read() as string);
	}

	Serialize(): string {
		return serializeTextgrid(this);
	}

	Add(tier: Tier<any>) {
		if(this.tierDict.has(tier.name)) {
			console.warn(`Tier "${tier.name}" already exists, skipping adding new tier`);
			return;
		}
		this.tierDict.set(tier.name, tier);
		tier.textgrid = this;
	}
}
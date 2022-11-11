import Tier from './tier.js';
import { Readable } from 'stream';
import { parseTextgrid, serializeTextgrid } from './utils.js';
import { IRange } from './range.js';

export default class TextGrid {
	tiers = new Map<string, Tier<IRange<any>>>();

	get length(): number {
		return Math.max(0, ...[...this.tiers.values()].map(tier => tier.length));
	}

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

	Add(tier: Tier<any>, force: boolean = false): boolean {
		if(!force && this.tiers.has(tier.name))
			return false;
		this.tiers.set(tier.name, tier);
		tier.textgrid = this;
		return true;
	}
}

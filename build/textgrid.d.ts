/// <reference types="node" />
import Tier from './tier.js';
import { Readable } from 'stream';
import { IRange } from './range.js';
export default class TextGrid {
    tierDict: Map<string, Tier<IRange<any>>>;
    get span(): number;
    get tiers(): Tier<IRange<any>>[];
    get tierNames(): string[];
    static FromString(str: string): TextGrid | null;
    static FromBlob(blob: Blob): Promise<TextGrid | null>;
    static FromFile(stream: Readable): TextGrid | null;
    Serialize(): string;
    Add(tier: Tier<any>): void;
}

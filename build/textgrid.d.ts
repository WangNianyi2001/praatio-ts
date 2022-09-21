/// <reference types="node" />
import Tier from './tier.js';
import { Readable } from 'stream';
import { IRange } from './range.js';
export default class TextGrid {
    tiers: Map<string, Tier<IRange<any>>>;
    get length(): number;
    static FromString(str: string): TextGrid | null;
    static FromBlob(blob: Blob): Promise<TextGrid | null>;
    static FromFile(stream: Readable): TextGrid | null;
    Serialize(): string;
    Add(tier: Tier<any>, force?: boolean): boolean;
}

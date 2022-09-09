/// <reference types="node" />
import Tier from './tier.js';
import { Readable } from 'stream';
export default class TextGrid {
    tierDict: Map<string, Tier<any, any>>;
    get start(): number;
    get end(): number;
    get tiers(): Tier<any, any>[];
    get tierNames(): string[];
    static FromString(str: string): TextGrid | null;
    static FromBlob(blob: Blob): Promise<TextGrid | null>;
    static FromFile(stream: Readable): TextGrid | null;
    Serialize(): string;
    Add(tier: Tier<any, any>): void;
}

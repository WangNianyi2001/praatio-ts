import { TextGrid } from './textgrid';
/**
 * Formats a textgrid instance for saving to a .csv file
 * @param {TextGrid} tg
 * @param {string} pivotTierName - One row in the output is listed for each entry in this tier.
 *  The corresponding entry in each tier will be provided on the same row
 *  along with the start and end time of the entry from the pivot tier.
 * @param {Array} [tierNameList=null] - the list of tier names to save.  If null, save all tiers.
 * @return {text}
 */
declare function serializeTextgridToCsv(tg: any, pivotTierName: any, tierNameList?: any, includeHeader?: boolean): string;
/**
 * Formats a textgrid instance for saving to a .TextGrid file.
 * @param {TextGrid} tg
 * @param {number} [minTimestamp = null] -- the minTimestamp of the saved Textgrid; if None, use whatever is defined in the Textgrid object.  If minTimestamp is larger than timestamps in your textgrid, an exception will be thrown.
 * @param {number} [maxTimestamp = null] -- the maxTimestamp of the saved Textgrid; if None, use whatever is defined in the Textgrid object.  If maxTimestamp is larger than timestamps in your textgrid, an exception will be thrown.
 * @param {boolean} [useShortForm = true] -- specifies whether to use the short or long form specification of a textgrid;  the long form is more human readable, the short form is more compact
 * @return A text representation of a textgrid that can be opened by Praat
 */
declare function serializeTextgrid(tg: any): string;
/**
 * Processing done before every textgrid is saved (serializeTextgrid calls this function) -- gaps are filled with silence and short intervals can be removed
 * @param {TextGrid} tg
 */
declare function prepTgForSaving(tg: TextGrid): TextGrid;
/**
 * Creates an instance of a Textgrid from the contents of a .Textgrid file.
 * @param {Buffer|string} text - can be either a buffer or a raw text string
 * @param {boolean} readRaw - default false; if true, points and intervals with an empty label '' are removed
 * @return {TextGrid}
 */
declare function parseTextgrid(text: any, readRaw?: boolean): any;
/**
 * Decodes a buffer from utf16/8 to text.
 * @param {Buffer} buffer - if not of type Buffer, it will be returned without modification.
 * @return {string}
 * @ignore
 */
declare function decodeBuffer(buffer: any): any;
export { parseTextgrid, serializeTextgrid, serializeTextgridToCsv, decodeBuffer, prepTgForSaving };

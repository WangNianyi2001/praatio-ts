/**
 * This module contains the methods that take one or more
 * tiers or textgrids and returns a modified result.<br /><br />
 *
 * @author Nianyi Wang
 * @since September 8, 2022
 * @module textgrid_modifiers
 */
import { TextGrid, Tier } from './textgrid';
import { NonMatchingTiersException, OvershootModificationException, IncorrectArgumentException } from './exceptions';
declare function concatTextgrid(tg1: any, tg2: any, filterTierNames?: boolean): TextGrid;
declare function concatTier(tier1: any, tier2: any): Tier;
/**
 * Creates a textgrid that only contains intervals from the crop region
 * @param {TextGrid} tg
 * @param {number} cropStart
 * @param {number} cropEnd
 * @param {string} mode - one of 'strict', 'lax', or 'truncated'
 *  If 'strict', only intervals wholly contained by the crop interval will be kept.
 *  If 'lax', partially contained intervals will be kept.
 *  If 'truncated', partially contained intervals will be truncated to fit within the crop region.
 * @param {boolean} rebaseToZero - if true, the all times in entries will be subtracted by the cropStart
 * @return {TextGrid} A new textgrid containing only entries that appear in the crop region.
 */
declare function cropTextgrid(tg: any, cropStart: any, cropEnd: any, mode: any, rebaseToZero: any): TextGrid;
/**
 * Creates a new tier containing only entries from inside the crop interval
 * @param {Tier} tier
 * @param {number} cropStart
 * @param {number} cropEnd
 * @param {string} mode - mode is ignored.  This parameter is kept for compatibility with IntervalTier.crop()
 * @param {boolean} rebaseToZero - if true, all times will be subtracted by cropStart
 * @return {Tier} Returns a copy of this tier with only values from the crop region.
 */
declare function cropTier(tier: any, cropStart: any, cropEnd: any, mode: any, rebaseToZero: any): any;
/**
 * Modifies all timestamps in the Textgrid and in the contained tiers by a constant amount
 * @param {TextGrid} tg
 * @param {number} offset - the amount to modify all timestamps by
 * @param {boolean} [allowOvershoot=false] - if false and offset pushes a value past maxTimestamp, throw an error; otherwise, lengthen the textgrid
 * @return {TextGrid}
 */
declare function editTextgridTimestamps(tg: any, offset: any, allowOvershoot?: boolean): TextGrid;
/**
 * Modifies all timestamps by a constant amount
 * @param {Tier} tier
 * @param {number} offset
 * @param {boolean} [allowOvershoot=false] - if false and offset pushes a value past maxTimestamp, throw an error; otherwise, lengthen the tier
 * @return {Tier}
 */
declare function editTierTimestamps(tier: any, offset: any, allowOvershoot?: boolean): any;
/**
 * Makes a region in all tiers blank (removes all contained entries)
 * @param {Tier} tg
 * @param {number} start
 * @param {number} stop
 * @param {boolean} doShrink - if true, all values after the erase region will be shifted earlier in time by (stop - start) seconds
 * @return {Tier} A copy of this textgrid without entries in the specified region.
 */
declare function eraseRegionFromTextgrid(tg: any, start: any, stop: any, doShrink: any): TextGrid;
/**
 * Makes a region in a tier blank (removes all contained entries)
 * @param {Tier} tier
 * @param {number} start
 * @param {number} stop
 * @param {boolean} doShrink - if true, all values after the erase region will be shifted earlier in time by (stop - start) seconds
 * @return {Tier} A copy of this tier without entries in the specified region.
 */
declare function eraseRegionFromTier(tier: any, start: any, stop: any, doShrink: any, collisionCode: any): any;
/**
 * Inserts a blank region into a textgrid
 * @param {TextGrid} tg
 * @param {number} start
 * @param {number} duration - Note: every item that occurs after /start/ will be pushed back by /duration/ seconds.
 * @param {boolean} collisionCode - if /start/ occurs inside a labeled interval, this determines the behaviour.
 *  Must be one of 'stretch', 'split', or 'no change'
 *  'stretch' - stretches the interval by /duration/ amount
 *  'split' - splits the interval into two--everything to the
                        right of 'start' will be advanced by 'duration' seconds
 *  'no change' - leaves the interval as is with no change
 * @return {TextGrid} A copy of this textgrid with the inserted blank region.
 */
declare function insertSpaceIntoTextgrid(tg: any, start: any, duration: any, collisionCode: any): TextGrid;
/**
 * Inserts a blank region into a tier
 * @param {Tier} tier
 * @param {number} start
 * @param {number} duration - Note: every item that occurs after /start/ will be pushed back by /duration/ seconds.
 * @param {boolean} collisionCode - (unused parameter for point tiers) if /start/ occurs inside a labeled interval, this determines the behaviour.
 *  Must be one of 'stretch', 'split', or 'no change'
 *  'stretch' - stretches the interval by /duration/ amount
 *  'split' - splits the interval into two--everything to the
                        right of 'start' will be advanced by 'duration' seconds
 *  'no change' - leaves the interval as is with no change
 * @return {Tier} A copy of this tier with the inserted blank region.
 */
declare function insertSpaceIntoTier(tier: any, start: any, duration: any, collisionCode: any): any;
/**
 * Combine tiers in a textgrid.
 * @param {TextGrid} tg
 * @param {Array} [tierNameList=null] - The list of tier names to include in the merge.  If null, all tiers are merged.
 * @param {boolean} [preserveOtherTiers=true] - If true, keep tiers that were not merged.
 *  If false, the return textgrid will only have one merged tier for all interval tiers and one merged tier for all point tiers, if present.
 * @param {string} [intervalTierName='merged intervals']
 * @param {string} [pointTierName='merged points']
 * @return {TextGrid} A copy of the textgrid with the specified tiers merged.
 */
declare function mergeTextgridTiers(tg: any, tierNameList?: any, preserveOtherTiers?: boolean, intervalTierName?: string, pointTierName?: string): TextGrid;
/**
 * Takes the set union of two tiers.
 * All the entries in the second tier will be added to the first.
 * Overlapping entries will be merged together.
 * @params {Tier} tier1 - the base tier
 * @params {Tier} tier2 - the tier to union into the base tier
 * @return {Tier}
 */
declare function takeTierUnion(tier1: any, tier2: any): any;
/**
 * Takes the set difference of this tier and the given one.
 * Any overlapping portions of entries with entries in this textgrid
 * will be removed from the returned tier.
 * @params {Tier} tier1 - the base tier
 * @params {Tier} tier2 - the tier to take the difference of with the base tier
 * @return {Tier}
 */
declare function takeIntervalTierDifference(tier1: any, tier2: any): any;
/**
 * Takes the set intersection of this tier and the given one.
 * Only intervals that exist in both tiers will remain in the
 * returned tier.  If intervals partially overlap, only the overlapping
 * portion will be returned.
 * @params {Tier} tier1 - the base tier
 * @params {Tier} tier2 - the tier to intersect the base tier with
 * @return {Tier}
 */
declare function takeIntervalTierIntersection(tier1: any, tier2: any): any;
export { concatTextgrid as appendTextgrid, concatTier as appendTier, cropTextgrid, cropTier, editTextgridTimestamps, editTierTimestamps, eraseRegionFromTextgrid, eraseRegionFromTier, insertSpaceIntoTextgrid, insertSpaceIntoTier, mergeTextgridTiers, takeTierUnion, takeIntervalTierDifference, takeIntervalTierIntersection, NonMatchingTiersException, OvershootModificationException, IncorrectArgumentException };

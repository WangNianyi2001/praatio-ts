import TextGrid from './textgrid.js';
declare function serializeTextgrid(tg: TextGrid): string;
declare function parseTextgrid(text: string): TextGrid | null;
export { parseTextgrid, serializeTextgrid };

# textgrid-js

This is a NodeJS package for manipulating Praat textgrid files.
It is written in the ES Module style.

## Installation

```shell
$ npm i @nianyi-wang/textgrid
```

## Usage

The following code snippet shows how to iterate through certain tier in a Textgrid file and change their labels.

```javascript
import { TextGrid, IntervalTier } from '@nianyi-wang/textgrid';
import * as Fs from 'fs';

// Input
const src = './input.Textgrid';
const tg = TextGrid.FromString(fs.readFileSync(src).toString());

// TextGrid manipulations
const tier = tg.tiers.get('phonemes');
function ProcessLabel(label) {
	// TODO
	return label;
}
for(const range of tier)
	tier.label = ProcessLabel(tier.label);

// Output
fs.writeFileSync(src, tg.Serialize());
```

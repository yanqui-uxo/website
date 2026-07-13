import { existsSync } from 'node:fs';
import sharp from 'sharp';
import cards from '../../routes/expert-battles/cards.json' with { type: 'json' };
import { branch } from './config.ts';

const overwrite = false;

for (const { id } of cards) {
	const path = `../../routes/expert-battles/images/${id}.avif`;
	if (!overwrite && existsSync(path)) {
		continue;
	}

	const url = `https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/refs/heads/${branch}/images/cards/${id}.png`;
	const resp = await fetch(url);
	const arrayBuffer = await resp.arrayBuffer();
	sharp(arrayBuffer).resize(100, undefined, { fit: 'inside' }).toFile(path);
}

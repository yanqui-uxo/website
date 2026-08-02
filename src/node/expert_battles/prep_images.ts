import { existsSync } from 'node:fs';
import sharp from 'sharp';
import cards from '../../routes/expert-battles/cards.json' with { type: 'json' };

const imagesDir = 'images';
const overwrite = false;

for (const card of cards) {
	const path = `../../routes/expert-battles/images/${card.id}.avif`;
	if (!overwrite && existsSync(path)) {
		continue;
	}

	sharp(`${imagesDir}/${card.image}`).resize(100, undefined, { fit: 'inside' }).toFile(path);
}

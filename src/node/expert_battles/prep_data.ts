import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { readFileSync, writeFileSync } from 'node:fs';
import { Cards, type Deck, type DeckCard } from '../../lib/expert_battles/deck_types.ts';
import unknownDecksJson from './unknown_decks.json' with { type: 'json' };

// HTML taken from https://game8.co/games/Pokemon-TCG-Pocket/archives/483771
// Cannot be downloaded automatically due to AWS challenge
const html = readFileSync('expert_battles.html').toString();
const $ = cheerio.load(html);

const cardIds: Set<string> = new Set<string>();

for (const deck of unknownDecksJson) {
	for (const card of deck) {
		cardIds.add(card.id);
	}
}
const unknownDecks: Deck[] = unknownDecksJson.map((deck) => ({
	name: 'Unknown',
	set: 'N/A',
	cards: deck
}));

const imgAltRegex = /([\w-]+) (\d+)/;
function deckListTableToCards(table: cheerio.Cheerio<Element>): DeckCard[] {
	return table
		.find('td')
		.map((_, el) => {
			const img = $(el).find('img');
			const alt = img.attr('alt');
			if (!alt) {
				throw new Error(`Alt missing in img in td with text ${$(el).text()}`);
			}

			const altMatch = alt.match(imgAltRegex);
			if (!altMatch || !altMatch[1] || !altMatch[2]) {
				throw new Error(`Img alt regex failed on "${alt}"`);
			}
			const [setId, number] = [altMatch[1].replace('-', '').toLowerCase(), altMatch[2]];
			const id = `${setId}-${number}`;
			cardIds.add(id);

			const text = $(el).text();
			const countMatch = text.match(/\d/);
			if (!countMatch || !countMatch[0]) {
				throw new Error(`Card regex failed on "${text}"`);
			}
			const count = parseInt(countMatch[0]);

			return {
				id,
				count
			};
		})
		.toArray();
}

const deckRegex = /\s*(.+?)(?: Deck)? \((.+)\)/;
const htmlDecks = $('table:contains("All Solo Battles")')
	.map((_, el) => {
		const text = $(el).find('td').first().text();
		const match = text.match(deckRegex);
		if (!match || !match[1] || !match[2]) {
			throw new Error(`Deck regex failed on "${text}"`);
		}

		const [name, set] = [match[1], match[2]];

		const table = $(el).nextAll('table:contains("Deck")').first();
		return {
			name,
			set,
			cards: deckListTableToCards(table)
		};
	})
	.toArray();

writeFileSync(
	'../../lib/assets/expert_battles/decks.json',
	JSON.stringify(htmlDecks.concat(unknownDecks)),
	{
		flag: 'w'
	}
);

const cardsJsonResponse = await fetch(
	'https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/refs/heads/main/v4.json'
);
const cardsJson = await cardsJsonResponse.json();
const cards = Cards.parse(cardsJson).filter((c) => cardIds.has(c.id));
writeFileSync('../../lib/assets/expert_battles/cards.json', JSON.stringify(cards), { flag: 'w' });

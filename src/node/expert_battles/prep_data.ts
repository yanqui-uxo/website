import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { readFileSync, writeFileSync } from 'node:fs';
import * as z from 'zod';
import { branch } from './config.ts';
import fixedDecks from './fixed_decks.json' with { type: 'json' };
import unknownDecksJson from './unknown_decks.json' with { type: 'json' };

// HTML taken from https://game8.co/games/Pokemon-TCG-Pocket/archives/483771
// Cannot be downloaded automatically due to AWS challenge
const html = readFileSync('expert_battles.html').toString();
const $ = cheerio.load(html);

const cardIds: Set<string> = new Set<string>();

for (const deck of unknownDecksJson) {
	for (const card of deck.cards) {
		cardIds.add(card.id);
	}
}
const unknownDecks = unknownDecksJson.map((deck) => ({
	name: deck.name,
	set: 'N/A',
	cards: deck.cards
}));

const imgAltRegex = /([\w-]+) (\d+)/;
function deckListTableToCards(table: cheerio.Cheerio<Element>) {
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

		const fixedDeck = fixedDecks.find((deck) => deck.name === name && deck.set === set);
		if (fixedDeck) {
			for (const { id } of fixedDeck.cards) {
				cardIds.add(id);
			}
			return fixedDeck;
		}

		const table = $(el).nextAll('table:contains("Deck")').first();
		return {
			name,
			set,
			cards: deckListTableToCards(table)
		};
	})
	.toArray();
const decks = htmlDecks.concat(unknownDecks);

const cardsJsonResponse = await fetch(
	`https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/refs/heads/${branch}/v4.json`
);
const cardsJson = await cardsJsonResponse.json();

const Cards = z.array(
	z.object({ id: z.string(), name: z.string(), rarity: z.string(), artist: z.string() })
);
const cards = Cards.parse(cardsJson).filter((c) => cardIds.has(c.id));

const dupeExceptions = ['a4b-165'];
const dupes = Object.fromEntries(
	cards
		.filter((card) => card.id.startsWith('a4b'))
		.map((card) => [
			card.id,
			dupeExceptions.includes(card.id)
				? undefined
				: cards.find(
						(otherCard) =>
							!otherCard.id.startsWith('a4b') &&
							card.name === otherCard.name &&
							card.rarity === otherCard.rarity &&
							card.artist === otherCard.artist
					)
		])
);
const dedupedCards = cards
	.filter((card) => !dupes[card.id])
	.map((card) => ({
		id: card.id,
		name: card.name
	}));

const dedupedDecks = decks.map((deck) => ({
	...deck,
	cards: deck.cards.map((card) => {
		const dupe = dupes[card.id];
		return dupe ? { id: dupe.id, count: card.count } : card;
	})
}));

writeFileSync('../../routes/expert-battles/decks.json', JSON.stringify(dedupedDecks));
writeFileSync('../../routes/expert-battles/cards.json', JSON.stringify(dedupedCards));

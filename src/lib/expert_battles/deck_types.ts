import * as z from 'zod';

const Card = z.object({
	id: z.string(),
	name: z.string()
});
export type Card = z.infer<typeof Card>;
export const Cards = z.array(Card);

const DeckCard = z.object({ id: z.string(), count: z.number() });
export type DeckCard = z.infer<typeof DeckCard>;
const Deck = z.object({
	name: z.string(),
	set: z.string(),
	cards: z.array(DeckCard)
});
export type Deck = z.infer<typeof Deck>;
export const Decks = z.array(Deck);

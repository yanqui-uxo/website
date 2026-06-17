<script>
	import cards from '$lib/assets/expert_battles/cards.json';
	import decks from '$lib/assets/expert_battles/decks.json';

	let search = $state('');
	let matchingCards = $derived(
		cards.filter((card) => card.name.toLowerCase().includes(search.toLowerCase()))
	);
	let matchingCardIds = $derived(matchingCards.map((card) => card.id));
	let matchingDecks = $derived(
		decks.filter((deck) => {
			const deckIds = deck.cards.map((card) => card.id);
			return deckIds.some((id) => matchingCardIds.includes(id));
		})
	);
</script>

<input class="border-black border-2" bind:value={search} />

{#each matchingDecks as deck (deck)}
	<h1>{deck.name} ({deck.set})</h1>
	<div class="flex">
		{#each deck.cards as card (card.id)}
			<div class="relative">
				<img
					src={`https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/refs/heads/main/images/cards/${card.id}.png`}
					class="w-24 h-auto"
					alt={card.id}
				/>
				<p class="absolute z-10 bottom-0 right-0 bg-white border-black border-2">{card.count}</p>
			</div>
		{/each}
	</div>
{/each}

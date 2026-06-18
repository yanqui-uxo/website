<script>
	import cards from '$lib/assets/expert_battles/cards.json';
	import decks from '$lib/assets/expert_battles/decks.json';

	const idsToNames = Object.fromEntries(cards.map((card) => [card.id, card.name]));

	let search = $state('');
	let searchTerms = $derived(search.split(',').map((search) => search.trim()));
	let matchingCardArrays = $derived(
		searchTerms.map((search) =>
			cards.filter((card) => card.name.toLowerCase().includes(search.toLowerCase()))
		)
	);
	let matchingCardIdArrays = $derived(
		matchingCardArrays.map((cards) => cards.map((card) => card.id))
	);
	let matchingDecks = $derived(
		decks.filter((deck) => {
			const deckIds = deck.cards.map((card) => card.id);
			return matchingCardIdArrays.every((ids) => deckIds.some((id) => ids.includes(id)));
		})
	);

	let showImages = $state(false);
</script>

<p>Search for cards, use commas between the cards to search for multiple</p>
<input class="input" bind:value={search} />

<input type="checkbox" id="showimages" class="checkbox" bind:checked={showImages} />
<label for="showimages">Show images (WARNING: uses a lot of data)</label>

{#each matchingDecks as deck (deck)}
	<h1 class="text-2xl">{deck.name} ({deck.set})</h1>
	{#if showImages}
		<div class="flex">
			{#each deck.cards as card (card.id)}
				<div class="relative">
					<img
						src={`https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/refs/heads/main/images/cards/${card.id}.png`}
						class="w-24 h-auto"
						alt={card.id}
					/>
					<p class="text-2xl absolute z-10 bottom-0 right-0 bg-black rounded-full">{card.count}</p>
				</div>
			{/each}
		</div>
	{:else}
		<ul class="list-disc list-inside">
			{#each deck.cards as card (card.id)}
				<li>{idsToNames[card.id]} ({card.id}) x{card.count}</li>
			{/each}
		</ul>
	{/if}
{/each}

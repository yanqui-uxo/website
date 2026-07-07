<script lang="ts">
	import cards from '$lib/assets/expert_battles/cards.json';
	import decks from '$lib/assets/expert_battles/decks.json';

	const imports = import.meta.glob<string>('$lib/assets/expert_battles/images/*.avif', {
		eager: true,
		import: 'default'
	});
	const idsToImagePaths = Object.fromEntries(
		Object.entries(imports).map(([origPath, path]) => [
			origPath.replace(/.+\/(.+)\.avif/, '$1'),
			path
		])
	);

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
</script>

<svelte:head>
	<title>Expert Battles</title>
</svelte:head>

<p>Search for cards, use commas between the cards to search for multiple</p>
<input class="input" bind:value={search} />

{#each matchingDecks as deck (deck)}
	<div class="collapse collapse-arrow">
		<input type="checkbox" />
		<h1 class="collapse-title text-2xl">{deck.name} ({deck.set})</h1>
		<div class="collapse-content">
			<div class="flex flex-wrap gap-1">
				{#each deck.cards as card (card.id)}
					<div class="relative">
						<img
							src={idsToImagePaths[card.id]}
							alt={`${idsToNames[card.id]} (${card.id})`}
							loading="lazy"
							class="w-24 h-auto"
						/>
						<p class="right-0 bottom-0 z-10 absolute bg-black rounded-sm text-2xl">
							{card.count}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/each}

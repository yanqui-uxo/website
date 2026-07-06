<script lang="ts">
	import cards from '$lib/assets/expert_battles/cards.json';
	import decks from '$lib/assets/expert_battles/decks.json';
	import type { Picture } from '@sveltejs/enhanced-img';
	import { PersistedState } from 'runed';

	const imports = import.meta.glob<Picture>('$lib/assets/expert_battles/images/*.avif', {
		eager: true,
		import: 'default',
		query: {
			enhanced: true
		}
	});

	const idsToPictures = Object.fromEntries(
		Object.entries(imports).map(([origPath, picture]) => [
			origPath.replace(/.+\/(.+)\.avif/, '$1'),
			picture
		])
	);
	function getPicture(id: string): Picture {
		const picture = idsToPictures[id];
		if (!picture) {
			throw new Error(`ID ${id} does not have associated picture`);
		}
		return picture;
	}

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

	let showImages = new PersistedState('showImages', false);
</script>

<svelte:head>
	<title>Expert Battles</title>
</svelte:head>

<p>Search for cards, use commas between the cards to search for multiple</p>
<input class="input" bind:value={search} />

<input type="checkbox" id="showimages" class="checkbox" bind:checked={showImages.current} />
<label for="showimages"
	>Show images (WARNING: may be slow on less powerful devices/connections)</label
>

{#each matchingDecks as deck (deck)}
	<br />

	<h1 class="text-2xl">{deck.name} ({deck.set})</h1>
	{#if showImages.current}
		<div class="flex flex-wrap gap-1">
			{#each deck.cards as card (card.id)}
				<div class="relative">
					<enhanced:img
						src={getPicture(card.id)}
						alt={`${idsToNames[card.id]} (${card.id})`}
						class="w-24 h-auto"
					/>
					<p class="text-2xl absolute z-10 bottom-0 right-0 bg-black rounded-sm">{card.count}</p>
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

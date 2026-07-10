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

	function idToLink(id: string) {
		const match = id.match(/(\w+)-(\d+)/);
		if (!match?.[1] || !match?.[2]) {
			throw new Error(`Regex failed on ID ${id}`);
		}

		const [set, number] = [match[1], parseInt(match[2])];
		const linkSet = set.replace(/^p([a-z])$/, 'p-$1');
		return `https://pocket.limitlesstcg.com/cards/${linkSet}/${number}`;
	}

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
		<input type="checkbox" checked />
		<h1 class="collapse-title text-2xl">{deck.name} ({deck.set})</h1>
		<div class="collapse-content flex flex-wrap gap-2">
			{#each deck.cards as card (card.id)}
				<a href={idToLink(card.id)} rel="external" class="link">
					<figure class="flex flex-col justify-end gap-1 w-24 h-full">
						<figcaption class="text-xs text-center">
							{idsToNames[card.id]} <br /> ({card.id})
						</figcaption>
						<div class="relative">
							<img
								src={idsToImagePaths[card.id]}
								alt={`${idsToNames[card.id]} (${card.id})`}
								loading="lazy"
							/>
							<p class="right-0 bottom-0 z-10 absolute bg-black rounded-sm text-white text-2xl">
								{card.count}
							</p>
						</div>
					</figure>
				</a>
			{/each}
		</div>
	</div>
{/each}

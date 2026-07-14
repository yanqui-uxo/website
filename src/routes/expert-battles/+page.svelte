<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import Card from './Card.svelte';
	import cards from './cards.json';
	import decksJson from './decks.json';

	type Card = (typeof cards)[number];

	const decks = decksJson.map((deck) => {
		const deckCards = deck.cards.map((deckCard) => {
			const name = cards.find((card) => card.id === deckCard.id)?.name;
			if (!name) {
				throw new Error(`No card with ID ${deckCard.id} in cards.json`);
			}
			return { ...deckCard, name };
		});
		return { ...deck, cards: deckCards };
	});

	function idToLink(id: string): string {
		const match = id.match(/(\w+)-(\d+)/);
		if (!match?.[1] || !match?.[2]) {
			throw new Error(`Regex failed on ID ${id}`);
		}

		const [set, number] = [match[1], parseInt(match[2])];
		const linkSet = set.replace(/^p([a-z])$/, 'p-$1');
		return `https://pocket.limitlesstcg.com/cards/${linkSet}/${number}`;
	}

	let searchInput: HTMLInputElement;
	let search = $state('');
	let matchingCards = $derived.by(() => {
		if (search.length < 2) {
			return [];
		}
		return cards.filter(
			(card) => !selectedCards.has(card) && card.name.toLowerCase().includes(search.toLowerCase())
		);
	});

	let selectedCards = new SvelteSet<Card>();

	let matchingDecks = $derived(
		decks.filter((deck) => {
			const deckIds = deck.cards.map((card) => card.id);
			return [...selectedCards].every((card) => deckIds.includes(card.id));
		})
	);

	function handleCardAdd(card: Card) {
		selectedCards.add(card);
		search = '';
		searchInput.focus();
	}
	function handleCardRemove(card: Card) {
		selectedCards.delete(card);
		searchInput.focus();
	}
</script>

<svelte:head>
	<title>Expert Battles</title>
</svelte:head>

<input
	id="search"
	class="block input"
	placeholder="Card name"
	bind:value={search}
	bind:this={searchInput}
/>

<br />

<p>Matches (click to select):</p>
{#if matchingCards.length > 0}
	<div class="flex flex-wrap gap-2">
		{#each matchingCards as card (card.id)}
			<button type="button" onclick={() => handleCardAdd(card)}>
				<Card {card} />
			</button>
		{/each}
	</div>
{/if}

<br />

<p>Selected (click to remove):</p>
{#if selectedCards.size > 0}
	<div class="flex flex-wrap gap-2">
		{#each selectedCards as card (card.id)}
			<button type="button" onclick={() => handleCardRemove(card)}>
				<Card {card} />
			</button>
		{/each}
	</div>

	<button
		type="button"
		class="btn"
		onclick={() => {
			selectedCards.clear();
			searchInput.focus();
		}}>Clear all</button
	>
{/if}

<br />

{#each matchingDecks as deck (deck)}
	<div class="collapse collapse-arrow">
		<input type="checkbox" checked />
		<h1 class="collapse-title text-2xl">{deck.name} ({deck.set})</h1>
		<div class="collapse-content flex flex-wrap gap-2">
			{#each deck.cards as card (card.id)}
				<a href={idToLink(card.id)} rel="external" target="_blank" class="link">
					<Card {card} count={card.count} />
				</a>
			{/each}
		</div>
	</div>
{/each}

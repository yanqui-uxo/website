<script module lang="ts">
	const imports = import.meta.glob<string>('./images/*.avif', {
		import: 'default'
	});
	const idsToImagePromises = Object.fromEntries(
		Object.entries(imports).map(([origPath, path]) => [
			origPath.replace(/.+\/(.+)\.avif/, '$1'),
			path
		])
	);
	async function getImagePath(id: string): Promise<string> {
		const promise = idsToImagePromises[id];
		if (!promise) {
			throw new Error(`No image for ID ${id}`);
		}

		return promise();
	}
</script>

<script lang="ts">
	type Props = {
		card: { id: string; name: string };
		count?: number;
	};
	let { card, count }: Props = $props();
</script>

<figure class="flex flex-col justify-end gap-1 w-24 h-full">
	<figcaption class="text-xs text-center">
		{card.name} <br /> ({card.id})
	</figcaption>
	<div class="relative">
		{#await getImagePath(card.id)}
			<p>{card.name} ({card.id})</p>
		{:then path}
			<img src={path} alt={`${card.name} (${card.id})`} loading="lazy" />
		{/await}
		{#if count !== undefined}
			<p class="right-0 bottom-0 z-10 absolute bg-black rounded-sm text-white text-2xl">
				{count}
			</p>
		{/if}
	</div>
</figure>

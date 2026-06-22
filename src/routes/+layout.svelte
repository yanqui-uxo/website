<script lang="ts">
	import './layout.css';
	const { children } = $props();
</script>

<div class="m-2">
	{@render children()}
</div>

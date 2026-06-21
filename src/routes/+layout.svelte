<script lang="ts">
	import './layout.css';
	let { children } = $props();
</script>

<div class="m-2">
	{@render children()}
</div>

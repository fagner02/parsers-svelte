<script>
	import InfoIcon from '@icons/InfoIcon.svelte';

	let { children } = $props();
</script>

<div class="instruction">
	<div class="instruction-icon">
		<InfoIcon size={18} color="white" strokeWidth={3}></InfoIcon>
	</div>
	<p>
		{@render children()}
	</p>
</div>

<style>
	.instruction {
		display: flex;
		border-radius: 5px;
		background: hsl(215, 15%, 90%);
		width: fit-content;
		font-family: 'Courier New', Courier, monospace;
		/* display: flex; */
		align-items: stretch;
		overflow: hidden;
	}
	.instruction > p {
		padding: 8px 10px;
	}
	.instruction-icon {
		background: hsl(0, 0%, 50%);
		padding: 0px 5px;
		display: grid;
		place-items: center;
	}
</style>

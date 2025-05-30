<script>
	import FillSize from '@/Layout/FillSize.svelte';
	import Header from '@/Layout/Header.svelte';
	import Tooltip from '@/Layout/Tooltip.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>VANSI: Visualizador de Analisadores Sintáticos</title>
	<meta
		name="description"
		content="VANSI é uma ferramenta para visualização e ensino de algoritmos de análise sintática"
	/>
</svelte:head>
<div id="app">
	<Header></Header>
	<Tooltip></Tooltip>
	<FillSize fillWidth={false} id="app-content" class="grid borders maxWidth">
		{#snippet content()}
			{@render children()}
		{/snippet}
	</FillSize>
</div>

<style>
	@import './styles.css';
	@import '@/block.css';

	:global(.borders) {
		margin: 10px;
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid hsl(200, 50%, 50%);

		box-shadow: inset 0px 0px 10px 0px hsl(0, 0%, 0%, 10%);
		margin-left: 0;
		margin: 10px;
		margin-top: 0;
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 860px) {
		:global(.borders) {
		}
	}
</style>

<script>
	import FillSize from '@/Layout/FillSize.svelte';
	import Header from '@/Layout/Header.svelte';
	import Tooltip from '@/Layout/Tooltip.svelte';
	import { noJumpWait } from '$lib/flowControl';
	import { beforeNavigate, afterNavigate } from '$app/navigation';

	let isNavigating = false;
	beforeNavigate(() => (isNavigating = true));
	afterNavigate(() => (isNavigating = false));

	let { children } = $props();

	(async () => {
		while (isNavigating) {
			console.log('wating');
			await noJumpWait(100);
		}

		let div = /**@type {HTMLElement}*/ (document.querySelector("div[name='discard']"));
		if (div === null) return;

		await noJumpWait(100);
		div.style.opacity = '0';
		div.style.transform = 'translate(0px, -20px)';
		await noJumpWait(1000);
		div.remove();
		return;
	})();
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

		display: flex;
	}

	@media (max-width: 860px) {
		#app {
			flex-direction: column;
		}
		:global(.borders) {
			margin: 10px;
			margin-top: 0px !important;
		}
		:global(header) {
			flex-direction: row !important;
			justify-content: space-between !important;
			align-items: center !important;
		}
	}
</style>

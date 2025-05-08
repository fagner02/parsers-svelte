<script>
	import { fontSize } from '$lib/globalStyle';
	import FillSize from '@/Layout/FillSize.svelte';
	import Header from '@/Layout/Header.svelte';
	import Tabs from '@/Tabs/Tabs.svelte';
	import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen';
	AndroidFullScreen.isImmersiveModeSupported()
		.then(() => AndroidFullScreen.immersiveMode())
		.catch(console.warn);
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
	<div class="tooltip" style="font-size: {fontSize}rem;">
		<span id="tooltip"></span>

		<svg
			class="arrow"
			width="54"
			height="48"
			viewBox="0 0 54 48"
			fill="hsl(200, 50%, 50%)"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M49.5 27.5C40.7959 35.5956 33.5 48 27 48C20.5 48 13.2041 35.5956 4.5 27.5C3.03317 26.1357 0.75 24 0.75 24H1C1 24 3.28317 21.8643 4.75 20.5C13.4541 12.4044 20.75 0 27.25 0C33.75 0 41.0459 12.4044 49.75 20.5C51.2168 21.8643 53.5 24 53.5 24H53.25C53.25 24 50.9668 26.1357 49.5 27.5Z"
			/>
		</svg>
	</div>
	<FillSize fillWidth={false} id="app-content" class="grid borders maxWidth">
		<Tabs class="unit "></Tabs>
	</FillSize>
</div>

<style>
	@import './styles.css';
	@import '@/block.css';

	.tooltip {
		z-index: 2;
		position: absolute;
		pointer-events: none;
		background: hsl(200, 50%, 50%);
		color: white;
		border-radius: 5px;
		padding: 5px 10px;
		opacity: 0;
		transition: all 0.2s;
	}
	.arrow {
		width: 20px;
		height: 20px;
		position: absolute;
		top: 0px;
		left: 0px;
	}

	:global(.borders) {
		margin: 10px;
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid hsl(200, 50%, 50%);

		box-shadow: inset 0px 0px 10px 0px hsl(0, 0%, 0%, 10%);
	}
</style>

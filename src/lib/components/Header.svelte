<script>
	import { Capacitor } from '@capacitor/core';
</script>

{#if Capacitor.getPlatform() === 'web' && /**@type {any}*/ (/**@type {any}*/ (window))?.__TAURI__ === undefined}{/if}
<header>
	<nav>
		<h1>Visualizador de Parsers</h1>
		<a href="/about">about</a>
		<a href="/">home</a>
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	nav {
		width: 100%;
		display: flex;
		justify-content: start;
		padding: 0px 20px;
		background: hsl(200, 50%, 50%);
	}
	nav > h1 {
		color: white;
		font-size: 12pt;
		line-height: 20pt;
		margin: 8px 0px;
		/* font-family: 'Trebuchet MS'; */
		font-weight: normal;
		text-transform: uppercase;
		/* font-variant: all-caps; */
	}
</style>

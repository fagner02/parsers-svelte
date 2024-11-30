<script>
	import { getPlatform, platforms } from '$lib/utils';
</script>

{#if getPlatform() === platforms.web}
	<header>
		<h1>VANSI</h1>
		<h2>Visualizador de Analisadores Sintáticos</h2>
	</header>
{/if}

<style>
	header {
		flex: 0;
		display: flex;
		justify-content: space-between;
		display: flex;
		justify-content: start;
		padding: 0px 20px;
		background: hsl(200, 0%, 100%);
		flex-direction: column;
		min-width: 200px;
		margin: 8px 0px;
	}

	header > * {
		color: hsl(200, 50%, 50%);
		font-size: 14pt;
		line-height: 18pt;
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
		font-weight: normal;
		text-transform: uppercase;
		margin: 0;
	}
	header > h2 {
		font-size: 12pt;
		color: hsl(200, 50%, 60%);
	}

	@media (max-width: 860px) {
		header {
			flex-direction: row;
		}
		header > h2 {
			display: none;
		}
	}
</style>

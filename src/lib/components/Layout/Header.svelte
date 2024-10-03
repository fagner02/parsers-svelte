<script>
	import { getPlatform, platforms } from '$lib/utils';
</script>

{#if getPlatform() === platforms.web}
	<header>
		<nav>
			<h1>Visualizador de Parsers</h1>
		</nav>
	</header>
{/if}

<style>
	header {
		flex: 0;
		display: flex;
		justify-content: space-between;
	}

	nav {
		display: flex;
		justify-content: start;
		padding: 0px 20px;
		background: hsl(200, 0%, 100%);
		flex-direction: column;
		min-width: 200px;
	}

	nav > h1 {
		color: hsl(200, 50%, 50%);
		font-size: 14pt;
		line-height: 18pt;
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
		margin: 8px 0px;
		font-weight: normal;
		text-transform: uppercase;
	}

	nav > * {
		height: fit-content;
	}

	@media (max-width: 700px) {
		nav {
			flex-direction: row;
		}
	}
</style>

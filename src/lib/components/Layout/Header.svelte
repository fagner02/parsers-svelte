<script>
	import { getPlatform, platforms } from '$lib/utils';
</script>

{#if getPlatform() === platforms.web}
	<header>
		<h1>VANSI</h1>
		<!-- <div>
			<a class="selected">Home</a>
			<a>About</a>
		</div> -->
	</header>
{/if}

<style>
	header {
		flex: 0;
		display: flex;
		display: flex;
		justify-content: start;
		padding: 0px 20px;
		background: hsl(200, 0%, 100%);
		flex-direction: column;
		margin: 8px 0px;
	}
	a {
		border-left: 2px solid hsl(200, 50%, 45%);
		padding-left: 5px;
	}
	.selected {
		border-width: 5px;
	}
	header > h1 {
		color: hsl(200, 50%, 50%);
		font-size: 16pt;
		line-height: 18pt;
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
		font-weight: normal;
		text-transform: uppercase;
		margin: 5px 0;
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

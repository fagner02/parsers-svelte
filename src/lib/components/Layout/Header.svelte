<script>
	import { setUpTooltip } from '$lib/tooltip';
	import { getPlatform, platforms } from '$lib/utils';
	import UserIcon from '@icons/UserIcon.svelte';
</script>

{#if getPlatform() === platforms.web}
	<header>
		<a href="/" use:setUpTooltip={{ text: 'Início' }}>
			<h1>VANSI</h1>
		</a>
		<a use:setUpTooltip={{ text: 'Entrar' }} href="/login">
			<UserIcon size={24} color="hsl(200,50%,50%)"></UserIcon>
		</a>
	</header>
{/if}

<style>
	header {
		flex: 0;
		display: flex;
		display: flex;
		justify-content: start;
		align-items: start;
		padding: 0px 20px;
		background: hsl(200, 0%, 100%);
		flex-direction: column;
		margin: 8px 0px;
	}
	h1 {
		color: hsl(200, 50%, 50%);
		font-size: 16pt;
		line-height: 18pt;
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
		font-weight: normal;
		text-transform: uppercase;
		margin: 5px 0;
	}
	a {
		text-decoration: none;
	}

	@media (max-width: 860px) {
		header {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}
</style>

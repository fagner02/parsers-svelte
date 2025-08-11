<script>
	import { supabase } from '$lib/log';
	import { setUpTooltip } from '@/Layout/tooltip';
	import { getPlatform, platforms } from '$lib/utils';
	import DropDown from './DropDown.svelte';

	let email = $state('');
	supabase.auth.getUser().then((v) => (email = v.data.user?.email ?? ''));
</script>

{#if getPlatform() === platforms.web}
	<header>
		<a href="/" use:setUpTooltip={{ text: 'Início' }}>
			<h1>VANSI</h1>
		</a>
		<DropDown></DropDown>
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
		align-items: start;
		justify-content: start;
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
</style>

<script>
	import { getPlatform, platforms } from '$lib/utils';
	import FillHeight from '@/Layout/FillHeight.svelte';
	import Header from '@/Layout/Header.svelte';
	import Tabs from '@/Tabs/Tabs.svelte';
	import { StatusBar, Style } from '@capacitor/status-bar';
	if (getPlatform() === platforms.mobile) {
		StatusBar.setStyle({ style: Style.Light });
	}
	const getLtik = () => {
		const searchParams = new URLSearchParams(window.location.search);
		const ltik = searchParams.get('ltik');
		if (!ltik) throw new Error('Missing lti key.');
		return ltik;
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>
<div id="app">
	<Header></Header>

	<FillHeight id="app-content" class="grid borders maxWidth">
		<Tabs class="unit "></Tabs>
	</FillHeight>
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
	}
</style>

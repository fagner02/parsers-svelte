<script>
	import FillHeightWrapper from '@/FillHeightWrapper.svelte';
	import Header from '@/Header.svelte';
	import Tabs from '@/Tabs/Tabs.svelte';
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
<div
	class="fill"
	id="app"
	style="border-radius:{/**@type {any}*/ (/**@type {any}*/ (window))?.__TAURI__ === undefined
		? 0
		: 0}px;"
>
	<Header></Header>

	<FillHeightWrapper class="maxWidth">
		<Tabs></Tabs>
	</FillHeightWrapper>
</div>

<style>
	@import './styles.css';
</style>

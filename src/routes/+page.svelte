<script>
	import Header from './Header.svelte';
	import TextInput from './TextInput.svelte';
	import StepsView from './StepsView.svelte';
	import TauriTitlebar from '../TauriTitlebar.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>
<div
	id="app"
	style="border-radius:{/**@type {any}*/ (/**@type {any}*/ (window))?.__TAURI__ === undefined
		? 0
		: 10}px"
>
	<TauriTitlebar></TauriTitlebar>
	<Header></Header>

	<section class="grid">
		<TextInput class="unit"></TextInput>
		<StepsView class="unit"></StepsView>
	</section>
</div>

<style>
	@import './styles.css';
</style>

<script>
	import Header from './Header.svelte';
	import TextInput from './TextInput.svelte';
	import StepsView from './StepsView.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<Header></Header>

<section class="grid">
	<TextInput class="unit"></TextInput>
	<StepsView class="unit"></StepsView>
</section>

<style>
	@import './styles.css';
</style>

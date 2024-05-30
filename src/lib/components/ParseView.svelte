<script>
	import FillHeight from './FillHeight.svelte';
	import SyntaxTree from './SyntaxTree.svelte';

	/**@type {string}*/
	export let inputString;
</script>

<div class="parse-tab">
	<SyntaxTree></SyntaxTree>
	<div class="parse">
		<input type="text" bind:value={inputString} placeholder="Digite a entrada aqui" />
		<FillHeight class="parse-view">
			<slot></slot>
		</FillHeight>
	</div>
</div>

<style>
	:global(.parse) {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	:global(.parse) > input {
		border-radius: 5px;
	}

	:global(.parse-view) {
		border: 1px solid hsl(0, 0%, 80%);
		border-radius: 10px;
		padding: 10px;
		overflow: auto;
	}

	:global(.parse-tab > *) {
		flex: 1;
	}

	.parse-tab {
		height: inherit;
		display: flex;
		gap: 10px;
	}
</style>

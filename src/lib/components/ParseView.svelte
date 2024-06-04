<script>
	import SyntaxTree from './SyntaxTree.svelte';
	import { getContext, setContext } from 'svelte';
	/** @type {() => Promise<void>}*/
	let addToTree;
	/**@type {string}*/
	export let inputString;
	/**@type {boolean | null}*/
	let accept = null;
	setContext('parseView', {
		setAccept: (/** @type {boolean | null} */ value) => {
			accept = value;
		}
	});
</script>

<div class="parse-tab">
	<SyntaxTree bind:addToTree></SyntaxTree>
	<div class="parse">
		<input
			type="text"
			bind:value={inputString}
			class={accept === null ? '' : accept ? 'accept' : 'reject'}
			placeholder="Digite a entrada aqui"
		/>
		<div class="parse-view">
			<slot></slot>
		</div>
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
		flex: 1;
	}

	:global(.parse-tab > div:nth-child(1)) {
		flex: 1;
	}
	:global(.parse-tab > div:nth-child(2)) {
		flex: 2;
	}

	@media (max-width: 500px) {
		.parse-tab {
			flex-direction: column-reverse;
		}
	}
	.parse-tab {
		height: inherit;
		display: flex;
		gap: 10px;
	}

	input {
		transition: all 0.5s;
	}

	.accept {
		background: hsl(100, 50%, 60%);
		outline: 2px solid hsl(100, 50%, 50%);
		color: white;
	}
	.reject {
		background: hsl(0, 50%, 60%);
		outline: 2px solid hsl(0, 50%, 50%);
		color: white;
	}
</style>

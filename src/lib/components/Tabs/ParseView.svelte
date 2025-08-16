<script>
	import { inputChanged } from '$lib/flowControl';
	import { setInputString } from '@/Layout/parseString';
	import { setContext } from 'svelte';
	/** @type {{
	 * tree?: import('svelte').Snippet<[{id: string}]>,
	 * parse?: import('svelte').Snippet,
	 * class?: string,
	 * id: string}} */
	let { tree, parse, ...props } = $props();

	/**@type {boolean | null}*/
	let accept = $state(null);
	setContext('parseView', {
		setAccept: (/** @type {boolean | null} */ value) => {
			accept = value;
		}
	});
</script>

<div class="parse-tab {props.class ?? ''}" id="parse-view{props.id}">
	{@render tree?.({ id: props.id })}
	<div class="parse">
		<input
			id="input-{props.id}"
			type="text"
			name="string a ser analisada"
			oninput={(v) => {
				setInputString(v.currentTarget.value);
				inputChanged(props.id);
				accept = null;
			}}
			class={accept === null ? '' : accept ? 'accept' : 'reject'}
			placeholder="Digite a entrada aqui"
		/>
		<div class="parse-view grid">
			{@render parse?.()}
		</div>
	</div>
</div>

<style>
	:global(.parse) {
		display: flex;
		flex-direction: column;
		gap: 10px;
		overflow: auto;
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
		overflow: hidden;
	}

	input {
		transition: all 0.5s;
	}

	.accept {
		background: hsl(100, 50%, 60%);
		border: 2px solid hsl(100, 50%, 50%);
		color: white;
	}
	.reject {
		background: hsl(0, 50%, 60%);
		border: 2px solid hsl(0, 50%, 50%);
		color: white;
	}
</style>

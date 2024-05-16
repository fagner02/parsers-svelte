<script>
	import { wait } from '$lib/utils';

	/** @type {import("svelte/store").Writable<Array.<import('./typedefs').GrammarItem>>} */
	export let rules;
	const grammar = 'S -> A Bb\nA -> a a\nBb -> b m';
	/**@type {number}*/
	export let lineHeight;
	/**@type {number}*/
	export let charWidth;
	/**@type {number}*/
	export let subCharWidth;
	/**@type {number}*/
	export let fontSize;
	let opacity = 0;
	let maxWidth = 0;
	let maxHeight = 0;

	export async function loadGrammar() {
		rules.update(() => []);

		opacity = 0;
		maxWidth = 0;
		maxHeight = 0;
		await wait(100);
		/**
		 * @type {{ left: string; right: string[]; index: number; }[]}
		 */
		let aux = [];
		grammar.split('\n').forEach((r) => {
			let s = r.split('->');

			if (s.length > 1) {
				aux.push({
					left: s[0].replaceAll(' ', ''),
					right: s[1].trim().split(' '),
					index: aux.length
				});
			}
		});

		await wait(50);
		rules.update(() => [...aux]);
		await wait(50);
		maxHeight = lineHeight * $rules.length;
		let max = $rules
			.map(
				(x) =>
					x.index.toString().length * subCharWidth +
					x.left.length * charWidth +
					x.right.length * (charWidth + 10) +
					3 * charWidth
			)
			.toSorted();

		maxWidth = max[max.length - 1];
		opacity = 1;
	}
</script>

<div class="grammar-box">
	<div
		class="card"
		id="grammar"
		style="min-height: {lineHeight}px; min-width:{charWidth}px;max-width: {maxWidth}px; max-height: {maxHeight}px;"
	>
		{#if $rules.length > 0}
			<div style="opacity: {opacity}; transition: opacity 0.5s 0.2s;">
				{#each $rules as rule, rulesIndex}
					<p
						style="line-height: {lineHeight}px; font-size: {fontSize}px; padding: 0px; width: fit-content"
					>
						<span id="gl{rulesIndex}"
							>{rule.left}<span style="font-size: 10px; position: absolute;translate: 0px 5px"
								>{rule.index}</span
							></span
						>
						<span>{'->'}</span>
						{#each rule.right as symbol, si}
							<span id="gr{rulesIndex}-{si}">{symbol}</span>
						{/each}
					</p>
				{/each}
			</div>
		{/if}
	</div>
	<div class="grammar-label blue">grammar</div>
</div>

<style>
	#grammar {
		height: fit-content;
		transition:
			max-width 0.5s,
			max-height 0.5s;
		overflow: hidden;
	}
	#grammar > div > p > span {
		margin: 0px 4px;
	}

	#grammar > div > p > span:nth-child(2) {
		margin: 0px;
	}

	#grammar > div > p > span:first-child {
		padding-right: 5px;
	}

	.grammar-label {
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		color: white;
	}

	.grammar-box {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
</style>

<script>
	import { writable } from 'svelte/store';
	import { getTextWidth, wait } from '$lib/textwidth';
	import { onMount } from 'svelte';
	import Stack from './Stack.svelte';

	/**@type {Stack}*/
	let istack;

	/**
	 * @param {any} node
	 * @param {{duration: number, delay: number}} params
	 */
	function firstIn(node, { duration, delay }) {
		return {
			delay,
			duration,
			/**
			 * @param {number} t
			 */
			css: (t) => `opacity: ${t < 0.5 ? 0 : (t - 0.5) / 0.5};
			width: ${charWidth * t}px;`
		};
	}

	/**
	 * @param {string} card
	 * @param {number} index1
	 * @param {string} color
	 * @param {boolean} empty
	 */
	async function selectLSymbol(card, index1, color, empty) {
		let symbol = /** @type {HTMLElement} */ (document.querySelector(`#${card}l${index1}`));
		symbol.classList.add(empty ? 'empty' : 'block');
		symbol.classList.add(`${color}-after`);
		await wait(500);
	}

	/**
	 * @param {string} card
	 * @param {number} index1
	 * @param {number} index2
	 * @param {string} color
	 * @param {boolean} empty
	 */
	async function selectRSymbol(card, index1, index2, color, empty) {
		let symbol = /** @type {HTMLElement} */ (
			document.querySelector(`#${card}r${index1}-${index2}`)
		);
		symbol.classList.add(empty ? 'empty' : 'block');
		symbol.classList.add(`${color}-after`);
		await wait(500);
	}

	/**
	 * @param {number} currentRule
	 */
	async function addToSymbolStack(currentRule) {
		await selectLSymbol('g', currentRule, 'blue', false);

		firstIndexes.set(rules[currentRule].left, first.length);
		first = [
			...first,
			{
				left: rules[currentRule].left,
				right: [{ value: ' ', width: charWidth, opacity: 0 }],
				showRight: false,
				rightAnim: [{ value: ' ', width: charWidth, opacity: 0 }]
			}
		];

		firstCard.style.height = `${lineHeight * first.length}px`;
		await wait(0);

		await selectLSymbol('f', currentRule, 'blue', false);

		first[firstIndexes.get(rules[currentRule].left)].showRight = true;
		await wait(0);
	}

	/**
	 * @param {number} index
	 * @param {string} symbol
	 */
	async function addSymbolToFirst(index, symbol) {
		first[index].rightAnim = [...first[index].rightAnim, { value: symbol, width: 0, opacity: 0 }];
		await wait(50);
		first[index].rightAnim[first[index].rightAnim.length - 1] = {
			value: symbol,
			width: charWidth,
			opacity: 1
		};
		await wait(500);
	}

	/**
	 * @param {Array<SetItem>} symbols
	 * @param {number} index
	 */
	async function addToFirst(symbols, index) {
		if (first[index].right[0].value === ' ') {
			first[index].right.pop();
			first[index].rightAnim.pop();
		}
		for (let i = 0; i < symbols.length; i++) {
			if (first[index].right.find((x) => x.value === symbols[i].value) === undefined) {
				first[index].right = [...first[index].right, symbols[i]];
				if (first[index].rightAnim.length > 0) {
					await addSymbolToFirst(index, ',');
				}
				if (first[index].rightAnim.length === 0) {
				}
				await addSymbolToFirst(index, symbols[i].value);
			}
		}
	}

	/**
	 * @param {number} index1
	 * @param {number} index2
	 */
	function firstSpanId(index1, index2) {
		return `fr${index1}-${index2}`;
	}

	/**
	 * @param {number} currentRule
	 * @param {Array<number>} prodStack
	 */
	async function nextProdSymbol(currentRule, prodStack) {
		prodStack[prodStack.length - 1]++;
		let prodPos = prodStack[prodStack.length - 1];
		if (prodPos >= rules[currentRule].right.length) {
			return null;
		}
		await selectRSymbol('g', currentRule, prodPos, 'green', true);
		return rules[currentRule].right[prodPos];
	}

	let grammar = 'S -> A Bb\nA -> a a\nBb -> b m';
	/**
	 * @type {Array.<{left: string, right: Array.<string>}>}
	 */
	let rules = [];
	let fontSize = 15;
	let lineHeight = 26;
	let charWidth = 0;

	/**
	 * @type {import("svelte/store").Writable<Array<import('./typedefs').StackItem<number>>>}
	 */
	let symbolStack = writable([]);
	let prodStack = [-1];
	let nt = ['S', 'A', 'Bb'];

	let firstIndexes = new Map();
	/** @type {HTMLElement}*/
	let firstCard;

	onMount(async () => {
		charWidth = getTextWidth('P', fontSize);

		grammar.split('\n').forEach((r) => {
			let s = r.split('->');

			if (s.length > 1) {
				rules.push({ left: s[0].replaceAll(' ', ''), right: s[1].trim().split(' ') });
			}
		});

		let grammarCard = /**@type {HTMLElement}*/ (document.querySelector('#grammar'));
		grammarCard.style.maxWidth = '0px';
		rules = rules;
		await istack.addToStack(symbolStack, 0, rules[0].left, rules[0].left.length * charWidth);

		await wait(200);

		grammarCard.style.height = `${lineHeight * rules.length}px`;
		grammarCard.style.maxWidth = `${grammarCard.scrollWidth}px`;

		firstCard = /**@type {HTMLElement}*/ (document.querySelector('.card.first-card'));

		while ($symbolStack.length > 0) {
			if (!firstIndexes.has(rules[$symbolStack[$symbolStack.length - 1].data]?.left)) {
				await addToSymbolStack($symbolStack[$symbolStack.length - 1].data);
			}

			while (true) {
				let symbol = await nextProdSymbol($symbolStack[$symbolStack.length - 1].data, prodStack);

				if (symbol === null) {
					prodStack.pop();

					let topRule = rules[$symbolStack[$symbolStack.length - 1].data];
					await istack.removeFromStack(symbolStack, $symbolStack.length - 1);
					await wait(1000);
					if ($symbolStack.length > 0) {
						let lastRule = rules[$symbolStack[$symbolStack.length - 1].data];
						await addToFirst(
							first[firstIndexes.get(topRule.left)].right,
							firstIndexes.get(lastRule.left)
						);
					}
					break;
				}
				if (nt.includes(symbol)) {
					await wait(1000);
					const ruleIndex = rules.findIndex((x) => x.left === symbol);
					await istack.addToStack(
						symbolStack,
						ruleIndex,
						rules[ruleIndex].left,
						rules[ruleIndex].left.length * charWidth
					);
					prodStack.push(-1);
					break;
				} else {
					let index = firstIndexes.get(rules[$symbolStack[$symbolStack.length - 1].data].left);
					await addToFirst([{ value: symbol, width: 0, opacity: 0 }], index);
					continue;
				}
			}
		}
	});

	/**
	 * @typedef {{value: string, width: number, opacity: number}} SetItem
	 * @type {Array.<{left: string, right: Array<SetItem>,showRight: boolean, rightAnim: Array<SetItem>}>}
	 */
	let first = [];
</script>

<div class="steps {$$props.class}" style="position: relative;">
	<div class="card" id="grammar">
		{#each rules as rule, i}
			<p
				style="line-height: {lineHeight}px; font-size: {fontSize}px; padding: 0px; width: fit-content"
			>
				<span id="gl{i}">{rule.left}</span>
				<span>{'->'}</span>
				{#each rule.right as symbol, si}
					<span id="gr{i}-{si}">{symbol}</span>
				{/each}
			</p>
		{/each}
	</div>
	<div class="card first-card">
		{#each first as f, index}
			<p
				id="fset{index}"
				style="line-height: {lineHeight}px;font-size:{fontSize}px; padding: 0px; width: fit-content"
			>
				<span id="fl{index}">{f.left}</span>
				{#if f.showRight}
					<span in:firstIn={{ duration: 500, delay: 0 }}>{':'}</span>
					<span in:firstIn={{ duration: 500, delay: 100 }}>{'{'}</span>

					{#each f.rightAnim as text, ri (`${index}-${ri}`)}
						<span style="width: {text.width}px;opacity:{text.opacity};" id={firstSpanId(index, ri)}>
							{#if text.value != ' '}
								{text.value}
							{:else}
								&nbsp;
							{/if}</span
						>
					{/each}

					<span in:firstIn={{ duration: 500, delay: 200 }}>{'}'}</span>
				{/if}
			</p>
		{/each}
	</div>

	<Stack {lineHeight} {charWidth} {symbolStack} {fontSize} stackId="i" bind:this={istack}></Stack>
</div>

<style>
	@import 'block.css';
	.card {
		height: 0px;
		background: white;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		transition: width 0.3s;
		overflow: hidden;
		width: fit-content;

		transition:
			max-width 0.5s,
			width 0.3s,
			height 0.3s;
		text-wrap: nowrap;
	}

	.steps {
		display: flex;
		justify-content: center;
		align-items: start;
		flex-wrap: wrap;
	}

	.floating {
		position: absolute;
		width: fit-content;
		background: hsl(200, 60%, 50%);
		color: white;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 6px;
		transition:
			top 0.5s,
			left 0.5s,
			opacity 0.5s;
	}

	.card > p > span {
		color: black;
		transition: color 0.3s;
	}

	.first-card > p > span:nth-child(2) {
		margin-left: 5px;
	}

	#grammar > p > span {
		margin: 0px 4px;
	}

	#grammar > p > span:nth-child(2) {
		margin: 0px;
	}

	#grammar > p > span:first-child {
		padding: 0px;
	}

	.first-card > p {
		padding: 0px;
		display: flex;
	}

	.card > p > span {
		transition:
			width 0.5s,
			opacity 0.5s;
		z-index: 1;
		position: relative;
	}
</style>

<script>
	import { getTextWidth, wait } from '$lib/textwidth';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	async function selectLSymbol(card, index1, color, empty) {
		let symbol = document.querySelector(`#${card}l${index1}`);
		symbol.classList.add(empty ? 'empty' : 'block');
		symbol.classList.add(color);
		await wait(500);
	}

	async function selectRSymbol(card, index1, index2, color, empty) {
		let symbol = document.querySelector(`#${card}r${index1}-${index2}`);
		symbol.classList.add(empty ? 'empty' : 'block');
		symbol.classList.add(color);
		await wait(500);
	}

	/**
	 * @param {Array<number>} ruleStack
	 */
	async function addToSymbolStack(ruleStack) {
		let currentRule = ruleStack[ruleStack.length - 1];
		await selectLSymbol('g', currentRule, 'blue', false);

		firstIndexes.set(rules[currentRule].left, first.length);
		first = [...first, { left: rules[currentRule].left, right: [' '], showRight: false }];

		firstCard.style.height = `${lineHeight * first.length}px`;
		firstCard.style.maxWidth = `${firstCard.scrollWidth}px`;
		await wait(0);

		await selectLSymbol('f', currentRule, 'blue', false);

		first[firstIndexes.get(rules[currentRule].left)].showRight = true;
		await wait(0);
		firstCard.style.maxWidth = `${firstCard.scrollWidth}px`;
		await wait(0);
	}

	async function addToFirst(symbols, index) {
		if (first[index].right[0] === ' ') {
			first[index].right = symbols;
		} else {
			for (let i = 0; i < symbols.length; i++) {
				if (!first[index].right.includes(symbols[i])) {
					first[index].right = [...first[index].right, symbols[i]];
					await wait(0);
					console.log('added');
					firstCard.style.maxWidth = `${firstCard.scrollWidth}px`;
					await wait(1000);
				}
			}
		}
	}

	export function firstSpanId(length, index1, index2) {
		return `fr${index1}-${index2}`;
	}

	/**
	 * @param {Array<number>} ruleStack
	 * @param {Array<number>} prodStack
	 * @returns {Promise<string | null>} symbol
	 */
	async function nextProdSymbol(ruleStack, prodStack) {
		let currentRule = ruleStack[ruleStack.length - 1];
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
	export let rules = [];
	export let fontSize = 15;
	export let lineHeight = 26;
	export let charWidth = 0;
	let nt = ['S', 'A', 'Bb'];

	let firstIndexes = new Map();
	/** @type {HTMLElement}*/
	let firstCard;

	onMount(async () => {
		charWidth = getTextWidth('0', fontSize);

		grammar.split('\n').forEach((r) => {
			let s = r.split('->');

			if (s.length > 1) {
				rules.push({ left: s[0].replaceAll(' ', ''), right: s[1].trim().split(' ') });
			}
		});

		let grammarCard = document.querySelector('#grammar');
		grammarCard.style.maxWidth = '0px';
		rules = rules;
		await wait(200);

		grammarCard.style.height = `${lineHeight * rules.length}px`;
		grammarCard.style.maxWidth = `${grammarCard.scrollWidth}px`;

		firstCard = document.querySelector('.card.first-card');

		let ruleStack = [0];
		let prodStack = [-1];

		while (ruleStack.length > 0) {
			if (!firstIndexes.has(rules[ruleStack[ruleStack.length - 1]]?.left)) {
				await addToSymbolStack(ruleStack, firstIndexes);
			}

			while (true) {
				let symbol = await nextProdSymbol(ruleStack, prodStack);

				if (symbol === null) {
					prodStack.pop();
					let topRule = rules[ruleStack.pop()];
					let lastRule = rules[ruleStack[ruleStack.length - 1]];
					if (ruleStack.length > 0) {
						await addToFirst(
							first[firstIndexes.get(topRule.left)].right,
							firstIndexes.get(lastRule.left)
						);
					}
					break;
				}
				if (nt.includes(symbol)) {
					ruleStack.push(rules.findIndex((x) => x.left === symbol));
					prodStack.push(-1);
					break;
				} else {
					let index = firstIndexes.get(rules[ruleStack[ruleStack.length - 1]].left);
					await addToFirst([symbol], index);
					continue;
				}
			}
		}
	});

	/**
	 * @type {Array.<{left: string, right: Array.<string>,showRight: boolean, whole: Array.<string>}>}
	 */
	export let first = [];
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
					<span in:fade={{ delay: 0 }}>{':'}</span>
					<span in:fade={{ delay: 100 }}>{'{'}</span>

					{#each f.right as text, ri}
						{#key text}
							{#await wait(100) then}
								<span id={firstSpanId(f.right.length, index, ri)}>
									{#if text != ' '}
										{text}
									{:else}
										&nbsp;
									{/if}</span
								>
							{/await}
							{#await wait(100) then}
								{#if ri < f.right.length - 1}
									<span>,</span>
								{/if}
							{/await}
						{/key}
					{/each}

					<span in:fade={{ delay: 300 }}>{'}'}</span>
				{/if}
			</p>
		{/each}
	</div>
</div>

<style>
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
		max-width: 0px;
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
		padding-left: 5px;
	}

	#grammar > p > span:nth-child(2) {
		padding: 0px;
		padding-left: 5px;
	}

	#grammar > p > span:first-child {
		padding: 0px;
	}

	#grammar > p > span {
		padding: 0px 5px;
	}

	.first-card > p {
		padding: 0px;
		display: flex;
	}

	@keyframes appear {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.card > p > span {
		animation: appear 1s;
		z-index: 1;
		position: relative;
	}

	@keyframes rotateAppear {
		from {
			transform: perspective(45px) rotateY(90deg);
		}
		to {
			transform: perspective(45px) rotateY(0deg);
		}
	}

	.block {
		position: relative;
		z-index: 0;
		color: white !important;
	}

	.block::after {
		content: '';
		position: absolute;
		z-index: -1;
		border-radius: 5px;
		transform: perspective(45px);
		--width: 100%;
		width: calc(var(--width) + 10px);
		--height: 23px;
		height: var(--height);
		top: 50%;
		translate: calc(var(--width) / -2) calc(var(--height) / -2);
		left: 50%;
		animation: rotateAppear 0.5s;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 6px;
	}

	.empty {
		position: relative;
		z-index: 0 !important;
		color: white !important;
	}

	.empty::after {
		content: '';
		position: absolute;
		z-index: -1;
		border-radius: 5px;
		transform: perspective(45px);
		--width: 100%;
		width: calc(var(--width) - 2px);
		--height: 20px;
		height: var(--height);
		top: 50%;
		translate: calc(var(--width) / -2) calc(var(--height) / -2);
		left: 50%;
		animation: rotateAppear 0.5s;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 6px;
	}

	.blue::after {
		background: hsl(200, 60%, 50%);

		box-shadow: 0px 0px 5px 0px hsl(200, 60%, 55%, 90%);
	}
	.green::after {
		background: hsl(100, 60%, 50%);

		box-shadow: 0px 0px 5px 0px hsl(100, 60%, 55%, 70%);
	}
	.yellow::after {
		background: hsl(60, 60%, 50%);
	}
</style>

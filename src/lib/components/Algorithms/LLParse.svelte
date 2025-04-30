<script>
	import { writable } from 'svelte/store';
	import TableCard from '@/Cards/TableCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { addPause, limitHit, setResetCall, wait } from '$lib/flowControl';
	import StackCard from '@/Cards/StackCard.svelte';
	import { getContext, onMount } from 'svelte';
	import { getTreeFunctions } from '$lib/treeFunctions';
	import { colors } from '$lib/selectSymbol';
	import { getGrammar } from '$lib/utils';
	import { setInfoComponent } from '$lib/infoText';
	import Ll1ParsingInfo from '@/Info/LL1ParsingInfo.svelte';
	import { inputString } from '$lib/parseString';
	import Code from '@/Layout/Code.svelte';
	import PseudoCode from '@/Layout/PseudoCode.svelte';

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<number>>>} */
	export let table;
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<any>[]>}*/
	let inputStack = writable([]);
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<any>[]>}*/
	let symbolStack = writable([]);
	/**@type {PseudoCode}*/
	let codeCard;

	/** @type {StackCard}*/
	let symbolStackElement;
	/** @type {StackCard}*/
	let inputStackElement;
	let { nt, t, rules, startingSymbol } = getGrammar();
	let context = getContext('parseView');

	let { initializeTree, addToTree, resetTree } = getTreeFunctions();

	function reset() {
		symbolStack.update(() => []);
		inputStack.update(() => []);
		svgLines?.setHideOpacity();
		context.setAccept(null);

		parsing();
	}
	setResetCall(reset);

	async function parsing() {
		try {
			await codeCard?.highlightLines([0]); // Line 0: Algorithm header
			await wait(100);
			resetTree();

			if (initializeTree === undefined) {
				let functions = getTreeFunctions();
				initializeTree = functions.initializeTree;
				addToTree = functions.addToTree;
				resetTree = functions.resetTree;
			}

			await codeCard?.highlightLines([1]); // Line 1: Initialize symbol stack
			for (let i of ['$', startingSymbol]) {
				await symbolStackElement.addToStack(i, i, '');
			}

			await codeCard?.highlightLines([2]); // Line 2: Initialize input stack
			for (let i of ['$'].concat(inputString.replaceAll(' ', '').split('').reverse())) {
				await inputStackElement.addToStack(i, i, '');
			}

			await addPause();
			await codeCard?.highlightLines([3]); // Line 3: Main loop
			while ($inputStack.length > 0) {
				await codeCard?.highlightLines([4]); // Line 4: Get top symbol
				const topSymbol = $symbolStack[$symbolStack.length - 1].data;
				await codeCard?.highlightLines([5]); // Line 5: Get top input
				const topInput = $inputStack[$inputStack.length - 1].data;

				await codeCard?.highlightLines([6]); // Line 6: Non-terminal check
				if (nt.includes(topSymbol)) {
					await codeCard?.highlightLines([7]); // Line 7: Get production
					const prodIndex = $table.get(topSymbol)?.get(topInput)?.data;

					await codeCard?.highlightLines([8]); // Line 8: Validate production
					if (prodIndex == null || prodIndex === -1) {
						await codeCard?.highlightLines([9]); // Line 9: Reject
						context.setAccept(false);
						return;
					}

					await codeCard?.highlightLines([10]); // Line 10: Remove symbol
					await symbolStackElement.removeFromStack($symbolStack.length - 1);

					await codeCard?.highlightLines([11]); // Line 11: Empty production check
					if (!rules[prodIndex].right.includes('')) {
						await codeCard?.highlightLines([12]); // Line 12: Push reversed production
						const prod = [...rules[prodIndex].right].reverse();
						for (let p of prod) {
							await symbolStackElement.addToStack(p, p, '');
						}
					}
				} else {
					await codeCard?.highlightLines([13]); // Line 13: Terminal case
					await codeCard?.highlightLines([14]); // Line 14: Match check
					if (topSymbol !== topInput) {
						await codeCard?.highlightLines([15]); // Line 15: Reject
						context.setAccept(false);
						limitHit();
						return;
					}

					await codeCard?.highlightLines([16]); // Line 16: Remove symbol
					await symbolStackElement.removeFromStack($symbolStack.length - 1);
					await codeCard?.highlightLines([17]); // Line 17: Remove input
					await inputStackElement.removeFromStack($inputStack.length - 1);
				}

				await addPause();
			}

			await codeCard?.highlightLines([18]); // Line 18: Final check
			const result = $inputStack.length === 0 && $symbolStack.length === 0;
			context.setAccept(result);
			limitHit();
			await addPause();
		} catch (e) {}
	}

	onMount(async () => {
		fetch('./llparse.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		setInfoComponent(Ll1ParsingInfo);
		await parsing();
	});
</script>

<SvgLines bind:this={svgLines} svgId="llparse"></SvgLines>
<div class="grid unit">
	<div class="unit">
		<PseudoCode bind:this={codeCard}></PseudoCode>
	</div>
	<div class="cards-box unit">
		<TableCard
			rows={nt}
			columns={t}
			{table}
			bind:svgLines
			tableId="ll"
			label="tabela ll(1)"
			hue={colors.blue}
		></TableCard>
		<StackCard
			bind:svgLines
			bind:stack={inputStack}
			bind:this={inputStackElement}
			stackId="input"
			hue={colors.green}
			label="entrada"
		></StackCard>
		<StackCard
			bind:svgLines
			bind:stack={symbolStack}
			bind:this={symbolStackElement}
			stackId="symbols"
			hue={colors.green}
			label="pilha de símbolos"
		></StackCard>
	</div>
</div>

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

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<number>>>} */
	export let table;
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<any>[]>}*/
	let inputStack = writable([]);
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<any>[]>}*/
	let symbolStack = writable([]);

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
			await wait(100);
			resetTree();

			if (initializeTree === undefined) {
				let functions = getTreeFunctions();
				initializeTree = functions.initializeTree;
				addToTree = functions.addToTree;
				resetTree = functions.resetTree;
			}
			for (let i of ['$', startingSymbol]) {
				await symbolStackElement.addToStack(i, i, '');
			}

			await initializeTree(startingSymbol);

			for (let i of ['$'].concat(inputString.replaceAll(' ', '').split('').reverse())) {
				await inputStackElement.addToStack(i, i, '');
			}

			while ($inputStack.length > 0) {
				const topSymbol = $symbolStack[$symbolStack.length - 1].data;
				const topInput = $inputStack[$inputStack.length - 1].data;
				if (nt.includes(topSymbol)) {
					const prodIndex = $table.get(topSymbol)?.get(topInput)?.data;
					if (prodIndex == null) {
						context.setAccept(false);
						return;
					}

					await symbolStackElement.removeFromStack($symbolStack.length - 1);
					if (rules[prodIndex].right.includes('')) {
						addToTree(['\u03B5'], topSymbol);
						continue;
					}
					const prod = [...rules[prodIndex].right].reverse();

					addToTree([...rules[prodIndex].right], topSymbol);

					for (let p of prod) {
						await symbolStackElement.addToStack(p, p, '');
					}
				} else {
					if (topSymbol !== topInput) {
						context.setAccept(false);
						return;
					}

					await symbolStackElement.removeFromStack($symbolStack.length - 1);

					await inputStackElement.removeFromStack($inputStack.length - 1);

					if ($inputStack.length === 0) {
						context.setAccept(true);
					}
				}

				await addPause();
			}

			limitHit();
			await addPause();
		} catch (e) {}
	}

	onMount(async () => {
		setInfoComponent(Ll1ParsingInfo);
		await parsing();
	});
</script>

<SvgLines bind:this={svgLines} svgId="llparse"></SvgLines>
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

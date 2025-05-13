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
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	/** @type {{id: string, table: import('svelte/store').Writable<Map<string, import('@/types').tableCol<number>>>}} */
	let { id, table } = $props();
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<any>[]>}*/
	let inputStack = $state(writable([]));
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<any>[]>}*/
	let symbolStack = $state(writable([]));

	let codeCard = /**@type {PseudoCode}*/ ($state());

	let symbolStackElement = /** @type {StackCard}*/ ($state());
	let inputStackElement = /** @type {StackCard}*/ ($state());
	let { nt, t, rules, startingSymbol } = getGrammar();
	let context = getContext('parseView');

	let { initializeTree, addToTree, resetTree } = getTreeFunctions();

	function reset() {
		symbolStack.update(() => []);
		inputStack.update(() => []);
		svgLines?.setHideOpacity();
		context.setAccept(null);
		resetTree();

		parsing();
	}
	setResetCall(reset, id);

	async function parsing() {
		try {
			if (initializeTree === undefined) {
				let functions = getTreeFunctions();
				initializeTree = functions.initializeTree;
				addToTree = functions.addToTree;
				resetTree = functions.resetTree;
			}
			await addPause(id);
			await codeCard?.highlightLines([0]);
			resetTree();
			initializeTree(startingSymbol);
			await codeCard?.highlightLines([1]);
			for (let i of ['$', startingSymbol]) {
				await symbolStackElement.addToStack(i, i, '');
			}

			await codeCard?.highlightLines([2]);
			for (let i of ['$'].concat(inputString.reverse())) {
				await inputStackElement.addToStack(i, i, '');
			}

			await addPause(id);
			await codeCard?.highlightLines([3]);
			while ($inputStack.length > 0) {
				await codeCard?.highlightLines([4]);
				const topSymbol = $symbolStack[$symbolStack.length - 1].data;
				await codeCard?.highlightLines([5]);
				const topInput = $inputStack[$inputStack.length - 1].data;

				await codeCard?.highlightLines([6]);
				if (nt.includes(topSymbol)) {
					await codeCard?.highlightLines([7]);
					const prodIndex = $table.get(topSymbol)?.get(topInput)?.data;

					await codeCard?.highlightLines([8]);
					if (prodIndex == null || prodIndex === -1) {
						await codeCard?.highlightLines([9]);
						context.setAccept(false);
						return;
					}

					await codeCard?.highlightLines([10]);
					await symbolStackElement.removeFromStack($symbolStack.length - 1);

					await codeCard?.highlightLines([11]);
					if (!rules[prodIndex].right.includes('')) {
						await codeCard?.highlightLines([12]);
						const prod = [...rules[prodIndex].right].reverse();
						addToTree([...rules[prodIndex].right], topSymbol);
						for (let p of prod) {
							await symbolStackElement.addToStack(p, p, '');
						}
					} else {
						addToTree(['\u03B5'], topSymbol);
					}
				} else {
					await codeCard?.highlightLines([13]);
					await codeCard?.highlightLines([14]);
					if (topSymbol !== topInput) {
						await codeCard?.highlightLines([15]);
						context.setAccept(false);
						limitHit(id);
						return;
					}

					await codeCard?.highlightLines([16]);
					await symbolStackElement.removeFromStack($symbolStack.length - 1);
					await codeCard?.highlightLines([17]);
					await inputStackElement.removeFromStack($inputStack.length - 1);
				}

				await addPause(id);
			}

			await codeCard?.highlightLines([18]);
			const result = $inputStack.length === 0 && $symbolStack.length === 0;
			context.setAccept(result);
			limitHit(id);
			await addPause(id);
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

<SvgLines bind:this={svgLines} svgId="{id}-svg" {id}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="Análise sintática LL(1)" bind:this={codeCard} id="llparse"></PseudoCode>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<TableCard
			{id}
			rows={nt}
			columns={t}
			{table}
			bind:svgLines
			tableId="ll"
			label="tabela ll(1)"
			hue={colors.blue}
		></TableCard>
		<StackCard
			{id}
			bind:svgLines
			bind:stack={inputStack}
			bind:this={inputStackElement}
			stackId="input{id}"
			hue={colors.green}
			label="entrada"
		></StackCard>
		<StackCard
			{id}
			bind:svgLines
			bind:stack={symbolStack}
			bind:this={symbolStackElement}
			stackId="symbols{id}"
			hue={colors.green}
			label="pilha de símbolos"
		></StackCard>
	</div>
</div>

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
	import { id, elemIds, saves, functionCalls, llParsing } from '$lib/llparse';

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	/** @type {{
	 * table: import('svelte/store').Writable<Map<string, import('@/types').tableCol<number>>>
	 * tableData: Map<string, Map<string, number>>}} */
	let { table, tableData } = $props();
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
		llParsing(startingSymbol, inputString, nt, tableData, rules);
		symbolStack.update(() => []);
		inputStack.update(() => []);
		svgLines?.setHideOpacity();
		context.setAccept(null);
		resetTree();

		parsing();
	}
	setResetCall(reset, id);

	/**@type {any}*/
	const obj = {
		highlightLines: () => codeCard?.highlightLines,
		addToStackSymbols: () => symbolStackElement.addToStack,
		removeFromStackSymbols: () => symbolStackElement.removeFromStack,
		addToStackInput: () => inputStackElement.addToStack,
		removeFromStackInput: () => inputStackElement.removeFromStack,
		addToTree: () => addToTree,
		resetTree: () => resetTree,
		initializeTree: () => initializeTree,
		addPause: () => addPause,
		setAccept: () => context.setAccept
	};

	async function parsing() {
		try {
			for (let call of functionCalls) {
				if (!obj[call.name]) {
					console.error(`Function ${call.name} not found in map`);
					continue;
				}
				try {
					await obj[call.name]()(...call.args);
				} catch (e) {
					console.error(`Error calling function ${call.name}:`, call.trace, e);
				}
			}
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

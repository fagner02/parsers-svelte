<script>
	import { writable } from 'svelte/store';
	import TableCard from '@/Cards/TableCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { addPause, limitHit, setResetCall, wait } from '$lib/flowControl';
	import StackCard from '@/Cards/StackCard.svelte';
	import { getContext, onMount } from 'svelte';
	import { getTreeFunctions } from '$lib/treeFunctions';
	import { colors } from '$lib/selectSymbol';
	import { getAugGrammar } from '$lib/utils';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import { inputString } from '$lib/parseString';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { id, elemIds, saves, functionCalls, clrparsing } from '$lib/clrparse';

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let inputStack = $state(writable([]));
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let stateStack = $state(writable([]));
	/** @type {{
	 * table: import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>,
	 * stateList: any,
	 * tableData: Map<number, Map<string, string>>}} */
	let { table, tableData, stateList } = $props();

	let codeCard = /**@type {PseudoCode}*/ ($state());
	let stateStackElement = /** @type {StackCard}*/ ($state());
	let inputStackElement = /** @type {StackCard}*/ ($state());

	let { augRules, alphabet } = getAugGrammar();
	let context = getContext('parseView');

	let loadGrammar = /**@type {() => Promise<any>}*/ ($state());
	let { addFloatingNode: addFloatingNode, resetTree, addParent } = getTreeFunctions();

	function reset() {
		clrparsing(inputString, augRules, tableData);
		stateStack.update(() => []);
		inputStack.update(() => []);
		svgLines?.setHideOpacity();
		context.setAccept(null);
		resetTree();

		parsing();
	}
	setResetCall(reset, id);

	/**@type {any}*/
	const obj = {
		addPause: () => addPause,
		addFloatingNode: () => addFloatingNode,
		resetTree: () => resetTree,
		addParent: () => addParent,
		addToStackState: () => stateStackElement.addToStack,
		addToStackInput: () => inputStackElement.addToStack,
		removeFromStackState: () => stateStackElement.removeFromStack,
		removeFromStackInput: () => inputStackElement.removeFromStack,
		setAccept: () => context.setAccept,
		highlightLines: () => codeCard?.highlightLines
	};

	async function parsing() {
		try {
			for (let call of functionCalls) {
				if (!obj[call.name]) {
					console.error(`Function ${call.name} not found in map`);
					continue;
				}
				try {
					if (call.skip) obj[call.name]()(...call.args);
					else await obj[call.name]()(...call.args);
				} catch (e) {
					console.error(`Error calling function ${call.name}:`, call.trace, e);
				}
			}
		} catch (e) {}
	}
	onMount(async () => {
		fetch('./clrparse.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		loadGrammar();
		await parsing();
	});
</script>

<SvgLines bind:this={svgLines} svgId="{id}-svg" {id}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="Análise sintática LR(1)" bind:this={codeCard} id="clrparse"></PseudoCode>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard {id} cardId={id} isAugmented={true} bind:loadGrammar></GrammarCard>
		<TableCard
			{id}
			rows={stateList}
			columns={alphabet}
			{table}
			bind:svgLines
			tableId="clr{id}"
			label="tabela lr1"
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
			bind:stack={stateStack}
			bind:this={stateStackElement}
			stackId="symbols{id}"
			hue={colors.green}
			label="pilha de símbolos"
		></StackCard>
	</div>
</div>

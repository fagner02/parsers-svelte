<script>
	import { writable } from 'svelte/store';
	import TableCard from '@/Cards/TableCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { addPause, setMaxStep, setOnInputChanged, setResetCall } from '$lib/flowControl';
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
	import { stackCard } from '@/Tabs/dataToComp';

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
	let currentStep = 0;
	let stepChanged = false;
	let inputChanged = false;
	let { initializeTree, addToTree, resetTree, loadSyntaxTree } = getTreeFunctions();

	/**@param {number} step*/
	function setStep(step) {
		symbolStackElement.loadStack(stackCard(saves[step].symbolStack, {}));
		inputStackElement.loadStack(stackCard(saves[step].inputStack, {}));
		svgLines?.setHideOpacity();
		saves[step].accept === undefined
			? context.setAccept(null)
			: context.setAccept(saves[step].accept);
		resetTree();
		loadSyntaxTree(saves[step].tree, startingSymbol);
		currentStep = step;
		stepChanged = true;
	}
	setResetCall(setStep, saves.length - 1, id, () => currentStep);
	function onInputChanged() {
		llParsing(startingSymbol, inputString, nt, tableData, rules);
		setMaxStep(saves.length - 1, id);
		inputChanged = true;
	}
	setOnInputChanged(onInputChanged, id);

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
			let i = 0;
			while (i < functionCalls.length || stepChanged) {
				if (inputChanged) {
					currentStep = 0;
					stepChanged = false;
					inputChanged = false;
					i = 0;
					continue;
				}
				if (stepChanged) {
					stepChanged = false;
					i = saves[currentStep].functionCall;
					continue;
				}
				const call = functionCalls[i];
				try {
					if (call.skip !== undefined) obj[call.name]()(...call.args);
					else await obj[call.name]()(...call.args);
				} catch (e) {
					continue;
				}
				if (call.name === 'addPause') {
					currentStep++;
				}
				i++;
			}
		} catch (e) {}
	}

	onMount(async () => {
		fetch('./llparse.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		setInfoComponent(Ll1ParsingInfo);
		onInputChanged();
		parsing();
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
			tableId={elemIds.table}
			label="tabela ll(1)"
			hue={colors.blue}
			convert={(v) =>
				v > -1
					? `${rules[v].left} -> ${rules[v].right[0] === '' ? 'ε' : rules[v].right.join(' ')}`
					: ''}
		></TableCard>
		<StackCard
			{id}
			bind:svgLines
			bind:stack={inputStack}
			bind:this={inputStackElement}
			stackId={elemIds.input}
			hue={colors.green}
			label="entrada"
		></StackCard>
		<StackCard
			{id}
			bind:svgLines
			bind:stack={symbolStack}
			bind:this={symbolStackElement}
			stackId={elemIds.states}
			hue={colors.green}
			label="pilha de símbolos"
		></StackCard>
	</div>
</div>

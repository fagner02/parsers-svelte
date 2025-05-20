<script>
	import { writable } from 'svelte/store';
	import TableCard from '@/Cards/TableCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { addPause, setMaxStep, setOnInputChanged, setResetCall } from '$lib/flowControl';
	import StackCard from '@/Cards/StackCard.svelte';
	import { getContext, onMount } from 'svelte';
	import { getTree } from '$lib/treeFunctions';
	import { colors } from '$lib/selectSymbol';
	import { getAugGrammar } from '$lib/utils';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import { setInfoComponent } from '$lib/infoText';
	import SlrParsingInfo from '@/Info/SLRParsingInfo.svelte';
	import { inputString } from '$lib/parseString';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { id, elemIds, saves, functionCalls, slrparsing } from '$lib/slrparse';
	import { stackCard } from '@/Tabs/dataToComp';

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
	let currentStep = 0;
	let stepChanged = false;
	let inputChanged = false;
	let loadGrammar = /** @type {() => Promise<any>} */ ($state());

	let tree = getTree();

	/**@param {number} step*/
	function setStep(step) {
		const save = saves[step];
		if (save === undefined) {
			console.error(`Step ${step} not found`);
			console.log(saves);
			return;
		}
		stateStackElement.loadStack(stackCard(save.stateStack, {}));
		inputStackElement.loadStack(stackCard(save.inputStack, {}));
		svgLines?.setHideOpacity();
		save.accept === undefined ? context.setAccept(null) : context.setAccept(save.accept);
		tree.resetTree();
		tree.loadFloatingTree(save.tree);
		currentStep = step;
		stepChanged = true;
	}
	setResetCall(setStep, saves.length - 1, id, () => currentStep);

	function onInputChanged() {
		slrparsing(inputString, augRules, tableData);
		setMaxStep(saves.length - 1, id);
		inputChanged = true;
	}
	setOnInputChanged(onInputChanged, id);

	/**@type {any}*/
	const obj = {
		addPause: () => addPause,
		addFloatingNode: () => tree.addFloatingNode,
		addParent: () => tree.addParent,
		addToStackState: () => stateStackElement.addToStack,
		addToStackInput: () => inputStackElement.addToStack,
		removeFromStackState: () => stateStackElement.removeFromStack,
		removeFromStackInput: () => inputStackElement.removeFromStack,
		setAccept: () => context.setAccept,
		highlightLines: () => codeCard?.highlightLines
	};

	async function executeSteps() {
		try {
			let i = 0;
			while (i < functionCalls.length || stepChanged) {
				if (inputChanged) {
					setStep(0);
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
					if (!obj[call.name]) {
						console.error(`Function ${call.name} not found`);
						console.log(obj[call.name], call, obj);
						return executeSteps();
					}
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
		fetch('./slrparse.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		setInfoComponent(SlrParsingInfo);
		loadGrammar();
		onInputChanged();
		executeSteps();
	});
</script>

<SvgLines bind:this={svgLines} svgId="{id}-svg" {id}></SvgLines>
<div class="cards-box unit" id="card-box{id}">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="Análise sintática SLR" bind:this={codeCard} id="slrparse"></PseudoCode>
	</div>
	<GrammarCard {id} cardId={elemIds.grammar} isAugmented={true} bind:loadGrammar></GrammarCard>
	<TableCard
		{id}
		rows={stateList}
		columns={alphabet}
		{table}
		bind:svgLines
		tableId={elemIds.table}
		label="tabela slr"
		hue={colors.blue}
	></TableCard>
	<StackCard
		{id}
		bind:svgLines
		bind:stack={inputStack}
		bind:this={inputStackElement}
		stackId={elemIds.inputStack}
		hue={colors.green}
		label="entrada"
	></StackCard>
	<StackCard
		{id}
		bind:svgLines
		bind:stack={stateStack}
		bind:this={stateStackElement}
		stackId={elemIds.stateStack}
		hue={colors.green}
		label="pilha de estados"
	></StackCard>
</div>

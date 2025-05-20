<script>
	import { writable } from 'svelte/store';
	import TableCard from '@/Cards/TableCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import {
		addPause,
		setCurrentStep,
		setMaxStep,
		setOnInputChanged,
		setResetCall
	} from '$lib/flowControl';
	import StackCard from '@/Cards/StackCard.svelte';
	import { getContext, onMount } from 'svelte';
	import { getTree } from '$lib/treeFunctions';
	import { colors } from '$lib/selectSymbol';
	import { getAugGrammar } from '$lib/utils';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import { inputString } from '$lib/parseString';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { id, elemIds, saves, functionCalls, clrparsing } from '$lib/clrparse';
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

	let loadGrammar = /**@type {() => Promise<any>}*/ ($state());
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

		setCurrentStep(currentStep);
		stepChanged = true;
	}
	setResetCall(setStep, saves.length - 1, id, () => currentStep);

	function onInputChanged() {
		clrparsing(inputString, augRules, tableData);
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
					setCurrentStep(currentStep);
				}
				i++;
			}
		} catch (e) {}
	}
	onMount(async () => {
		fetch('./clrparse.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		loadGrammar();
		onInputChanged();
		executeSteps();
	});
</script>

<SvgLines bind:this={svgLines} svgId="{id}-svg" {id}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="Análise sintática LR(1)" bind:this={codeCard} id="clrparse"></PseudoCode>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard {id} cardId={elemIds.grammar} isAugmented={true} bind:loadGrammar></GrammarCard>
		<TableCard
			{id}
			rows={stateList}
			columns={alphabet}
			{table}
			bind:svgLines
			tableId={elemIds.table}
			label="tabela lr1"
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
			label="pilha de símbolos"
		></StackCard>
	</div>
</div>

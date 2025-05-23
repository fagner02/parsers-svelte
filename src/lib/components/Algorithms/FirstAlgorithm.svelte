<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { addPause, setCurrentStep, setStepCall } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import {
		colors,
		deselectSymbol,
		selectLSymbol,
		selectRSymbol,
		selectSymbol
	} from '$lib/selectSymbol';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { setInfoComponent } from '$lib/infoText';
	import FistInfo from '@/Info/FirstInfo.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { id, saves, elemIds, functionCalls, first } from '$lib/first';
	import { getGrammar } from '$lib/utils';
	import { stackCard } from '@/Tabs/dataToComp';

	/**@type {StackCard | undefined}*/
	let joinStackElement = $state();
	/**@type {SetsCard | undefined}*/
	let firstSetElement = $state();
	/**@type {SetsCard | undefined}*/
	let joinSetElement = $state();
	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());
	/**@type {PseudoCode | undefined}*/
	let codeCard = $state();

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let joinStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let firstSet = writable([]);
	/** @type { import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let joinSet = writable([]);

	/** @type {{ instruction: string,}} */
	let { instruction = $bindable() } = $props();

	/**@type {import('@/Cards/selectionFunction').SelectionFunctions | undefined}*/
	let grammarSelection;

	let { rules } = getGrammar();
	let currentStep = 0;
	let stepChanged = false;
	/**@type {number[]}*/
	let breakpoints = $state([]);

	/**@param {number} step*/
	function setStep(step) {
		const save = saves[step];
		if (save === undefined) {
			console.error(`Step ${step} not found`);
			return;
		}
		svgLines?.hideLine(false, id);
		save.grammarSelect === ''
			? grammarSelection?.hideSelect()
			: grammarSelection?.selectFor(save.grammarSelect);
		joinStackElement?.loadStack(stackCard(save.joinStack, { key: (a) => rules[a].left }));
		joinSetElement?.loadSets(save.join);
		firstSetElement?.loadSets(save.first);
		currentStep = step;
		setCurrentStep(currentStep);
		stepChanged = true;
	}
	setStepCall(setStep, saves.length - 1, id, () => currentStep);

	/**@type {any}*/
	const obj = {
		addPause: () => addPause,
		selectSymbol: () => selectSymbol,
		selectRSymbol: () => selectRSymbol,
		selectLSymbol: () => selectLSymbol,
		deselectSymbol: () => deselectSymbol,
		highlightLines: () => codeCard?.highlightLines,
		selectGrammar: () => grammarSelection?.selectFor,
		hideSelectGrammar: () => grammarSelection?.hideSelect,
		addSetRow: () => firstSetElement?.addSetRow,
		addSetRowJoin: () => joinSetElement?.addSetRow,
		addToStack: () => joinStackElement?.addToStack,
		removeFromStack: () => joinStackElement?.removeFromStack,
		joinSets: () => firstSetElement?.joinSets,
		joinSetsJoin: () => joinSetElement?.joinSets,
		removeSet: () => joinSetElement?.remove
	};

	async function executeSteps() {
		try {
			await loadGrammar();
			let i = 0;
			while (i < functionCalls.length || stepChanged) {
				if (stepChanged) {
					stepChanged = false;
					i = saves[currentStep].functionCall;
					continue;
				}
				const call = functionCalls[i];
				try {
					if (call.name === 'highlightLines' && breakpoints.some((x) => call.args[0].includes(x))) {
						codeCard?.highlightLines(call.args[0], colors.orange);
						await addPause(id);
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
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		grammarSelection = getSelectionFunctions(elemIds.grammar);
		fetch('./first.txt').then((data) => data.text().then((text) => codeCard?.setPseudoCode(text)));

		setInfoComponent(FistInfo);
		return executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode bind:breakpoints title="First" bind:this={codeCard} id="first"></PseudoCode>
	</div>
	<div class="unit cards-box" id="card-box{id}">
		<GrammarCard {id} cardId={elemIds.grammar} bind:loadGrammar></GrammarCard>
		<SetsCard
			setId={elemIds.first}
			set={firstSet}
			convert={{
				left: (value) => rules[value].left,
				noteLeft: (value) => value.toString()
			}}
			hue={colors.blue}
			label={'first set'}
			bind:this={firstSetElement}
			bind:svgLines
			{id}
		></SetsCard>
		<SetsCard
			setId={elemIds.join}
			set={joinSet}
			convert={{
				left: (v) => rules[v].left,
				noteLeft: (v) => v.toString(),
				right: (v) => rules[v].left,
				noteRight: (v) => v.toString()
			}}
			hue={colors.blue}
			label={'join set'}
			bind:this={joinSetElement}
			bind:svgLines
			{id}
		></SetsCard>
		<StackCard
			stack={joinStack}
			stackId={elemIds.joinStack}
			label="join stack"
			hue={colors.blue}
			bind:this={joinStackElement}
			bind:svgLines
			{id}
		></StackCard>
	</div>
</div>

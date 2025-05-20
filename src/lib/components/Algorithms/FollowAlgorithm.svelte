<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { addPause, setResetCall } from '$lib/flowControl';
	import { colors, selectRSymbol } from '$lib/selectSymbol';
	import { onMount } from 'svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { setInfoComponent } from '$lib/infoText';
	import FollowInfo from '@/Info/FollowInfo.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { id, saves, functionCalls, elemIds } from '$lib/follow';
	import { getGrammar } from '$lib/utils';
	import { stackCard } from '@/Tabs/dataToComp';

	/**@type {SetsCard | undefined}*/
	let followSetElement = $state();
	/**@type {SetsCard | undefined}*/
	let joinSetElement = $state();
	/**@type {StackCard | undefined}*/
	let joinStackElement = $state();
	/**@type {SvgLines | undefined}*/
	let svgLines = $state();
	/**@type {PseudoCode | undefined}*/
	let codeCard = $state();

	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());

	let currentStep = 0;
	let stepChanged = false;

	let { rules } = getGrammar();

	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let joinSet = writable([]);
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<string>>>} */
	let joinStack = writable([]);

	/** @type {{instruction: string, followSet?: import('svelte/store').Writable<Array<import('@/types').SetRow>>, firstSet: import('svelte/store').Writable<import('@/types').SetRow[]>}} */
	let { instruction = $bindable(), followSet = writable([]), firstSet } = $props();

	/**@type {import('@/Cards/selectionFunction').SelectionFunctions|undefined}*/
	let grammarSelection;

	/**
	 * @param {number} step
	 */
	function setStep(step) {
		const save = saves[step];
		if (save === undefined) {
			console.error(`Step ${step} not found`);
			console.log(saves);
			return;
		}
		svgLines?.hideLine(false, id);
		save.grammarSelect === ''
			? grammarSelection?.hideSelect()
			: grammarSelection?.selectFor(save.grammarSelect);
		followSetElement?.loadSets(save.follow);
		joinSetElement?.loadSets(save.join);
		joinStackElement?.loadStack(stackCard(save.joinStack, {}));

		currentStep = step;
		stepChanged = true;
	}
	setResetCall(setStep, saves.length - 1, id, () => currentStep);

	/**@type {any}*/
	const obj = {
		addPause: () => addPause,
		selectRSymbol: () => selectRSymbol,
		highlightLines: () => codeCard?.highlightLines,
		selectGrammar: () => grammarSelection?.selectFor,
		hideSelectGrammar: () => grammarSelection?.hideSelect,
		joinSetsFollow: () => followSetElement?.joinSets,
		addSetRowFollow: () => followSetElement?.addSetRow,
		addToStack: () => joinStackElement?.addToStack,
		removeFromStack: () => joinStackElement?.removeFromStack,
		addSetRowJoin: () => joinSetElement?.addSetRow,
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
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		grammarSelection = getSelectionFunctions(elemIds.grammar);
		fetch('./follow.txt').then((data) => data.text().then((text) => codeCard?.setPseudoCode(text)));
		setInfoComponent(FollowInfo);
		executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="Follow" bind:this={codeCard} id="follow"></PseudoCode>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard {id} cardId={elemIds.grammar} bind:loadGrammar></GrammarCard>
		<SetsCard
			{id}
			setId={elemIds.follow}
			set={followSet}
			hue={colors.blue}
			label={'follow set'}
			bind:this={followSetElement}
			bind:svgLines
		></SetsCard>
		<SetsCard
			{id}
			convert={{
				left: (value) => rules[value].left,
				noteLeft: (value) => value.toString()
			}}
			setId={elemIds.first}
			set={firstSet}
			hue={colors.blue}
			label={'first set'}
			bind:svgLines
		></SetsCard>
		<SetsCard
			{id}
			setId={elemIds.join}
			set={joinSet}
			hue={colors.blue}
			label={'join set'}
			bind:this={joinSetElement}
			bind:svgLines
		></SetsCard>
		<StackCard
			{id}
			stack={joinStack}
			stackId={elemIds.joinStack}
			label="join stack"
			hue={colors.blue}
			bind:this={joinStackElement}
			bind:svgLines
		></StackCard>
	</div>
</div>

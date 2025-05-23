<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { addPause } from '$lib/flowControl';
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
	import { StepExecution } from './exucuteSteps.svelte';

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

	/**@type {number[]}*/
	let breakpoints = $state([]);

	let { rules } = getGrammar();

	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let joinSet = writable([]);
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<string>>>} */
	let joinStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let followSet = writable([]);

	/** @type {{
	 * instruction: string,
	 * firstSet: import('svelte/store').Writable<import('@/types').SetRow[]>}} */
	let { instruction = $bindable(), firstSet } = $props();

	/**@type {import('@/Cards/selectionFunction').SelectionFunctions|undefined}*/
	let grammarSelection;

	/**
	 * @param {typeof saves[0]} save
	 */
	function setStepCallback(save) {
		svgLines?.hideLine(false, id);
		save.grammarSelect === ''
			? grammarSelection?.hideSelect()
			: grammarSelection?.selectFor(save.grammarSelect);
		followSetElement?.loadSets(save.follow);
		joinSetElement?.loadSets(save.join);
		joinStackElement?.loadStack(stackCard(save.joinStack, {}));
	}

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
	let stepExecution = new StepExecution(
		saves,
		functionCalls,
		[
			{
				func: obj.highlightLines,
				breakpoints: () => breakpoints
			}
		],
		obj,
		id,
		setStepCallback
	);

	onMount(async () => {
		grammarSelection = getSelectionFunctions(elemIds.grammar);
		fetch('./follow.txt').then((data) => data.text().then((text) => codeCard?.setPseudoCode(text)));

		loadGrammar();
		stepExecution.executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode bind:breakpoints title="Follow" bind:this={codeCard} id="follow"></PseudoCode>
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

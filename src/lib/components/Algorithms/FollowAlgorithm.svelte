<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { wait, addPause, limitHit, setResetCall } from '$lib/flowControl';
	import { colors, selectRSymbol } from '$lib/selectSymbol';
	import { onMount } from 'svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import { getGrammar } from '$lib/utils';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { setInfoComponent } from '$lib/infoText';
	import FollowInfo from '@/Info/FollowInfo.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { id, saves, functionCalls, elemIds } from '$lib/follow';

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

	let firstSetElement = /**@type {SetsCard}*/ ($state());
	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());

	let { nt, rules } = getGrammar();

	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let joinSet = writable([]);
	/**@type {Map<string, number>}*/
	let joinIndexes = $state(new Map());
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<string>>>} */
	let joinStack = writable([]);

	/** @type {{instruction: string, followSet?: import('svelte/store').Writable<Array<import('@/types').SetRow>>, firstSet: import('svelte/store').Writable<import('@/types').SetRow[]>}} */
	let { instruction = $bindable(), followSet = writable([]), firstSet } = $props();

	/**@type {Map<string, number>}*/
	let followIndexes = $state(new Map());
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions|undefined}*/
	let grammarSelection;

	function reset() {
		followSet.update(() => []);
		followIndexes = new Map();
		joinSet.update(() => []);
		joinIndexes = new Map();
		joinStack.update(() => []);
		svgLines?.setHideOpacity();
		grammarSelection?.hideSelect();
		codeCard?.reset();
		follow();
	}
	setResetCall(reset, id);

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

	async function follow() {
		try {
			await loadGrammar();
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
			// await addPause(id);

			// instruction = 'Since this thing is like that we have add to the stack';
			// await codeCard?.highlightLines([0, 1]);

			// await followSetElement?.addSetRow(rules[0].left, rules[0].left);
			// await codeCard?.highlightLines([2]);

			// await followSetElement?.joinSets(['$'], ['$'], null, rules[0].left);
			// await addPause(id);
			// for (let i = 0; i < rules.length; i++) {
			// 	await codeCard?.highlightLines([3]);

			// 	await grammarFuncs?.selectFor(`${id}gset${i}`);
			// 	for (let j = 0; j < rules[i].right.length; j++) {
			// 		await codeCard?.highlightLines([4]);

			// 		const symbol = rules[i].right[j];

			// 		await codeCard?.highlightLines([5]);
			// 		let followingSymbolIndex = j + 1;
			// 		let followingSymbol = j + 1 == rules[i].right.length ? null : rules[i].right[j + 1];

			// 		await codeCard?.highlightLines([6]);
			// 		if (!nt.includes(symbol)) {
			// 			await codeCard?.highlightLines([7]);

			// 			await selectRSymbol(`${id}g`, i, j, colors.green, id, false);
			// 			await addPause(id);
			// 			continue;
			// 		}
			// 		await codeCard?.highlightLines([8]);

			// 		await selectRSymbol(`${id}g`, i, j, colors.blue, id, false);

			// 		if (!followIndexes.has(symbol)) {
			// 			await codeCard?.highlightLines([9]);

			// 			await followSetElement?.addSetRow(symbol, symbol, `${id}gr${i}-${j}`);
			// 			await addPause(id);
			// 		}

			// 		await codeCard?.highlightLines([10]);
			// 		let pos = 1;
			// 		while (true) {
			// 			await codeCard?.highlightLines([11]);
			// 			await codeCard?.highlightLines([12]);
			// 			if (followingSymbol === null) {
			// 				await codeCard?.highlightLines([13]);
			// 				if (!joinSetElement?.has(symbol)) {
			// 					await codeCard?.highlightLines([14]);

			// 					await joinSetElement?.addSetRow(symbol, symbol, `${id}gr${i}-${j}`);
			// 					await addPause(id);
			// 				}
			// 				await codeCard?.highlightLines([15]);
			// 				if (rules[i].left !== symbol) {
			// 					await codeCard?.highlightLines([16]);
			// 					await joinSetElement?.joinSets(
			// 						[rules[i].left],
			// 						[rules[i].left],
			// 						null,
			// 						symbol,
			// 						`${id}gl${i}`
			// 					);
			// 					await addPause(id);
			// 				}
			// 				await codeCard?.highlightLines([17]);
			// 				break;
			// 			}
			// 			await codeCard?.highlightLines([18]);

			// 			await selectRSymbol(`${id}g`, i, j + 1, colors.orange, id, false);
			// 			if (nt.includes(followingSymbol)) {
			// 				await codeCard?.highlightLines([19]);
			// 				let empty = false;

			// 				for (let [key, item] of $firstSet.entries()) {
			// 					await codeCard?.highlightLines([20]);
			// 					await codeCard?.highlightLines([21]);
			// 					if (item.left === followingSymbol) {
			// 						await codeCard?.highlightLines([22]);
			// 						if (item.right.includes('')) {
			// 							await codeCard?.highlightLines([23]);
			// 							await codeCard?.highlightLines([24]);
			// 							empty = true;
			// 							continue;
			// 						}
			// 						await codeCard?.highlightLines([25]);
			// 						await codeCard?.highlightLines([26]);

			// 						await followSetElement?.joinSets(
			// 							item.right,
			// 							item.right,
			// 							null,
			// 							symbol,
			// 							`${firstSetElement.getSetId()}l${key}`
			// 						);
			// 						await addPause(id);
			// 					}
			// 				}
			// 				await codeCard?.highlightLines([27]);
			// 				if (!empty) {
			// 					await codeCard?.highlightLines([28]);
			// 					break;
			// 				}
			// 				await codeCard?.highlightLines([29]);
			// 				await codeCard?.highlightLines([30]);
			// 				followingSymbolIndex = j + 1 + pos;
			// 				followingSymbol =
			// 					j + 1 + pos == rules[i].right.length ? null : rules[i].right[j + 1 + pos];
			// 				pos++;
			// 				await codeCard?.highlightLines([31]);
			// 			} else {
			// 				await codeCard?.highlightLines([31]);
			// 				await codeCard?.highlightLines([32]);

			// 				await followSetElement?.joinSets(
			// 					[followingSymbol],
			// 					[followingSymbol],
			// 					null,
			// 					symbol,
			// 					`${id}gr${i}-${followingSymbolIndex}`
			// 				);
			// 				await addPause(id);
			// 				await codeCard?.highlightLines([33]);
			// 				break;
			// 			}
			// 		}

			// 		await selectRSymbol(`${id}g`, i, j, colors.green, id, false);
			// 	}
			// }
			// grammarFuncs?.hideSelect();
			// for (let item of joinIndexes.keys()) {
			// 	await codeCard?.highlightLines([34]);
			// 	await codeCard?.highlightLines([35]);
			// 	if (joinSetElement?.get(item)?.length === 0) {
			// 		await codeCard?.highlightLines([36]);
			// 		continue;
			// 	}
			// 	await codeCard?.highlightLines([37]);
			// 	await codeCard?.highlightLines([38]);

			// 	await joinStackElement?.addToStack(
			// 		item,
			// 		item,
			// 		'',
			// 		`${joinSetElement?.getSetId()}l${joinIndexes.get(item)}`
			// 	);
			// 	await addPause(id);

			// 	while ($joinStack.length > 0) {
			// 		await codeCard?.highlightLines([39]);
			// 		await codeCard?.highlightLines([40, 41]);
			// 		const topKey = $joinStack[$joinStack.length - 1].data;
			// 		const top = /**@type {Array<string>}*/ (joinSetElement?.get(topKey));

			// 		await codeCard?.highlightLines([42]);
			// 		let nextSet = joinSetElement?.get(top[0]);
			// 		if (
			// 			nextSet !== undefined &&
			// 			!(nextSet.length === 0) &&
			// 			!$joinStack.some((x) => x.data === top[0])
			// 		) {
			// 			await codeCard?.highlightLines([43]);

			// 			await joinStackElement?.addToStack(
			// 				top[0],
			// 				top[0],
			// 				'',
			// 				`${joinSetElement?.getSetId()}l${joinIndexes.get(top[0])}`
			// 			);
			// 			await addPause(id);
			// 			await codeCard?.highlightLines([44]);
			// 			continue;
			// 		}

			// 		await selectRSymbol(
			// 			/**@type {string}*/ (joinSetElement?.getSetId()),
			// 			/**@type {number}*/ (joinIndexes.get(topKey)),
			// 			0,
			// 			colors.green,
			// 			id
			// 		);

			// 		const setToJoin = /**@type {Array<string>}*/ (followSetElement?.get(top[0]));
			// 		await codeCard?.highlightLines([45]);
			// 		await codeCard?.highlightLines([46]);

			// 		await followSetElement?.joinSets(
			// 			setToJoin,
			// 			setToJoin,
			// 			null,
			// 			topKey,
			// 			`${followSetElement.getSetId()}l${followIndexes.get(top[0])}`
			// 		);
			// 		await addPause(id);
			// 		await codeCard?.highlightLines([47]);

			// 		await joinSetElement?.remove(topKey, top[0]);

			// 		await codeCard?.highlightLines([48]);
			// 		if (joinSetElement?.get(topKey)?.length === 0) {
			// 			await codeCard?.highlightLines([49]);

			// 			await joinStackElement?.removeFromStack($joinStack.length - 1);
			// 			await addPause(id);
			// 		}
			// 	}
			// }

			// limitHit(id);
			// await addPause(id);
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		grammarSelection = getSelectionFunctions(elemIds.grammar);
		fetch('./follow.txt').then((data) => data.text().then((text) => codeCard?.setPseudoCode(text)));
		setInfoComponent(FollowInfo);
		reset();
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
			useNote={false}
			set={followSet}
			setIndexes={followIndexes}
			hue={colors.blue}
			label={'follow set'}
			bind:this={followSetElement}
			bind:svgLines
		></SetsCard>
		<SetsCard
			{id}
			setId={elemIds.first}
			useNote={false}
			set={firstSet}
			setIndexes={followIndexes}
			hue={colors.blue}
			label={'first set'}
			bind:svgLines
			bind:this={firstSetElement}
		></SetsCard>
		<SetsCard
			{id}
			setId={elemIds.join}
			useNote={false}
			set={joinSet}
			setIndexes={joinIndexes}
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

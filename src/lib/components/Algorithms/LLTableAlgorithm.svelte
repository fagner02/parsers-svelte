<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import TableCard from '@/Cards/TableCard.svelte';
	import { addPause, setResetCall } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import { colors, deselectSymbol, selectSymbol } from '$lib/selectSymbol';
	import { getGrammar } from '$lib/utils';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { setInfoComponent } from '$lib/infoText';
	import LL1TableInfo from '@/Info/LL1TableInfo.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { id, saves, elemIds, functionCalls } from '$lib/lltable';
	import { tableCard } from '@/Tabs/dataToComp';

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();
	/**@type {PseudoCode | undefined}*/
	let codeCard = $state();
	/**@type {SetsCard | undefined}*/
	let firstCard = $state();
	/**@type {SetsCard | undefined}*/
	let followCard = $state();
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions | undefined}*/
	let firstFuncs;

	let tableElement = /**@type {TableCard}*/ ($state());
	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());
	let currentStep = 0;
	let stepChanged = false;
	let { nt, t, rules } = getGrammar();

	/** @type {{
	 * table?: import('svelte/store').Writable<Map<string, import('@/types').tableCol<any>>>,
	 * instruction: string,
	 * firstSet: import('svelte/store').Writable<import('@/types').SetRow[]>,
	 * followSet: import('svelte/store').Writable<import('@/types').SetRow[]>}} */
	let {
		table = $bindable(writable(new Map())),
		instruction = $bindable(),
		firstSet,
		followSet
	} = $props();

	let lastSelected = 0;
	/**@param {number} step*/
	function setStep(step) {
		if (lastSelected === step) return;
		svgLines?.setHideOpacity();
		for (let f of saves[lastSelected].firstSymbols) {
			deselectSymbol(f, id);
		}
		for (let f of saves[lastSelected].followSymbols) {
			deselectSymbol(f, id);
		}
		tableElement.resetTable();
		table.set(tableCard(saves[step].table, {}));
		const conflict = saves[step].conflict;
		if (conflict) {
			tableElement.showConflict(conflict.row, conflict.col);
			tableElement.setConflictTooltip(conflict.tooltip);
		}
		saves[step].firstSelect === ''
			? firstFuncs?.hideSelect()
			: firstFuncs?.selectFor(saves[step].firstSelect);
		for (let f of saves[step].firstSymbols) {
			selectSymbol(f, colors.green, id, false);
		}
		for (let f of saves[step].followSymbols) {
			selectSymbol(f, colors.green, id, false);
		}
		currentStep = step;
		stepChanged = true;
	}
	setResetCall(setStep, saves.length - 1, id, () => currentStep);

	/**@type {any}*/
	const obj = {
		addPause: () => addPause,
		selectSymbol: () => selectSymbol,
		deselectSymbol: () => deselectSymbol,
		highlightLines: () => codeCard?.highlightLines,
		selectFirst: () => firstFuncs?.selectFor,
		showConflict: () => tableElement?.showConflict,
		addToTable: () => tableElement?.addToTable,
		setConflictTooltip: () => tableElement?.setConflictTooltip,
		highlightOn: () => tableElement?.highlightOn,
		highlightOff: () => tableElement?.highlightOff
	};

	async function lltable() {
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
				lastSelected = currentStep;
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
			// await addPause(id);
			// instruction = 'Since this thing is like that we have add to the stack';

			// await codeCard?.highlightLines([0]);
			// for (let i = 0; i < $firstSet.length; i++) {
			// 	await codeCard?.highlightLines([1]);
			// 	const item = $firstSet[i];

			// 	await firstFuncs?.selectFor(`${firstCard?.getSetId()}set${i}`);
			// 	await codeCard?.highlightLines([2]);
			// 	await codeCard?.highlightLines([3]);
			// 	if (item.right.includes('')) {
			// 		await selectRSymbol(/**@type {string}*/ (firstCard?.getSetId()), i, 0, colors.green, id);
			// 		const followIndex = $followSet.findIndex((x) => x.left === item.left);
			// 		const follow = /**@type {import('@/types').SetRow}*/ ($followSet[followIndex]);
			// 		for (let f = 0; f < follow.right.length; f++) {
			// 			await codeCard?.highlightLines([4]);

			// 			selectRSymbol(
			// 				/**@type {string}*/ (followCard?.getSetId()),
			// 				followIndex,
			// 				f * 2,
			// 				colors.green,
			// 				id
			// 			);
			// 			await codeCard?.highlightLines([5]);

			// 			let cell = $table.get(item.left)?.get(follow.right[f]);
			// 			if (cell?.data !== null) {
			// 				await tableElement.showConflict(item.left, follow.right[f]);
			// 				let rule = `${item.left} -> ${rules[i].right[0] === '' ? 'ε' : rules[i].right.join(' ')}`;
			// 				tableElement.setConflictTooltip(
			// 					`Conflito: Regra [${rule}] vai ocupar o lugar da regra existente [${cell?.text}]`
			// 				);
			// 				await addPause(id);
			// 				limitHit(id);
			// 				await addPause(id);
			// 				return;
			// 			}

			// 			await tableElement.addToTable(
			// 				i,
			// 				rules[i].right[0] === ''
			// 					? `${item.left} -> ε`
			// 					: `${item.left} -> ${rules[i].right.join(' ')}`,
			// 				item.left,
			// 				follow.right[f]
			// 			);
			// 			await addPause(id);
			// 		}
			// 	}
			// 	for (let j = 0; j < item.right.length; j++) {
			// 		await codeCard?.highlightLines([6]);
			// 		await codeCard?.highlightLines([7]);
			// 		if (item.right[j] == '') {
			// 			continue;
			// 		}
			// 		await codeCard?.highlightLines([8]);

			// 		await selectRSymbol(
			// 			/**@type {string}*/ (firstCard?.getSetId()),
			// 			i,
			// 			j * 2,
			// 			colors.green,
			// 			id
			// 		);

			// 		let cell = $table.get(item.left)?.get(item.right[j]);
			// 		if (cell?.data !== null) {
			// 			await tableElement.showConflict(item.left, item.right[j]);
			// 			let rule = `${item.left} -> ${rules[i].right[0] === '' ? 'ε' : rules[i].right.join(' ')}`;
			// 			tableElement.setConflictTooltip(
			// 				`Conflito: Regra [${rule}] vai ocupar o lugar da regra existente [${cell?.text}]`
			// 			);
			// 			limitHit(id);
			// 			await addPause(id);
			// 			return;
			// 		}
			// 		await tableElement.addToTable(
			// 			parseFloat(/**@type {string}*/ (item.note)),
			// 			`${item.left} -> ${rules[i].right.join(' ')}`,
			// 			item.left,
			// 			item.right[j]
			// 		);
			// 		await addPause(id);
			// 	}
			// }

			// limitHit(id);
			// await addPause(id);
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		firstFuncs = getSelectionFunctions(elemIds.firstSet);
		tableElement?.resetTable();
		fetch('./lltable.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		setInfoComponent(LL1TableInfo);
		lltable();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="Tabela LL(1)" bind:this={codeCard} id="lltable"></PseudoCode>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard {id} cardId={elemIds.grammar} bind:loadGrammar></GrammarCard>
		<TableCard
			{id}
			rows={nt}
			columns={t}
			bind:table
			bind:svgLines
			bind:this={tableElement}
			convert={(v) =>
				v > -1
					? `${rules[v].left} -> ${rules[v].right[0] === '' ? 'ε' : rules[v].right.join(' ')}`
					: ''}
			tableId={elemIds.table}
			label="tabela ll(1)"
			hue={colors.blue}
		></TableCard>
		<SetsCard
			{id}
			setId={elemIds.followSet}
			set={followSet}
			hue={colors.blue}
			label={'follow set'}
			bind:this={followCard}
		></SetsCard>
		<SetsCard
			{id}
			setId={elemIds.firstSet}
			set={firstSet}
			convert={{
				left: (value) => rules[value].left,
				noteLeft: (value) => value.toString()
			}}
			hue={colors.blue}
			label={'first set'}
			bind:this={firstCard}
		></SetsCard>
	</div>
</div>

<style>
</style>

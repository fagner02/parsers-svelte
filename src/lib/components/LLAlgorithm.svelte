<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import SvgLines from '@/SvgLines.svelte';
	import TableCard from './Cards/TableCard.svelte';
	import {
		wait,
		addPause,
		limitHit,
		setResetCall,
		newRunningCall,
		currentlyRunning
	} from '$lib/flowControl';
	import { onMount } from 'svelte';
	import { getSelectionFunctions } from './Cards/selectionFunction';
	import { colors, selectRSymbol } from '$lib/selectSymbol';

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {TableCard}*/
	let tableElement;
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol>>} */
	export let table = writable(new Map());
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {string}*/
	export let instruction;

	/** @type {Array<import('@/types').GrammarItem>} */
	export let rules;
	/**@type {import('svelte/store').Writable<import('@/types').SetRow[]>}*/
	export let firstSet;
	/**@type {import('svelte/store').Writable<import('@/types').SetRow[]>}*/
	export let followSet;
	/**@type {Array<string>}*/
	export let nt;
	/**@type {Array<string>}*/
	export let t;

	function reset() {
		tableElement.resetTable();
		svgLines?.setHideOpacity();
		firstCard?.reloadElement();
		followCard?.reloadElement();
		firstFuncs?.hideSelect();

		lltable();
	}
	setResetCall(reset);

	/**@type {SetsCard | undefined}*/
	let firstCard;
	/**@type {SetsCard | undefined}*/
	let followCard;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions | undefined}*/
	let firstFuncs;

	async function lltable() {
		const id = newRunningCall();
		try {
			await wait(100);
			await loadGrammar();
			await addPause();
			instruction = 'Since this thing is like that we have add to the stack';

			for (let i = 0; i < $firstSet.length; i++) {
				const item = $firstSet[i];
				if (currentlyRunning != id) return;
				await firstFuncs?.selectFor(`${firstCard?.getSetId()}set${i}`);
				if (item.right.includes('')) {
					if (currentlyRunning != id) return;
					await selectRSymbol(/**@type {string}*/ (firstCard?.getSetId()), i, 0, colors.green);
					const followIndex = $followSet.findIndex((x) => x.left === item.left);
					const follow = /**@type {import('@/types').SetRow}*/ ($followSet[followIndex]);
					for (let f = 0; f < follow.right.length; f++) {
						if (currentlyRunning != id) return;
						selectRSymbol(
							/**@type {string}*/ (followCard?.getSetId()),
							followIndex,
							f * 2,
							colors.green
						);
						if (currentlyRunning != id) return;
						await tableElement.addToTable(
							i,
							rules[i].right[0] === ''
								? `${item.left} -> ε`
								: `${item.left} -> ${rules[i].right.join(' ')}`,
							item.left,
							follow.right[f]
						);
						await addPause();
					}
				}
				for (let j = 0; j < item.right.length; j++) {
					if (item.right[j] == '') {
						continue;
					}
					if (currentlyRunning != id) return;
					await selectRSymbol(/**@type {string}*/ (firstCard?.getSetId()), i, j * 2, colors.green);
					if (currentlyRunning != id) return;
					await tableElement.addToTable(
						parseFloat(/**@type {string}*/ (item.note)),
						`${item.left} -> ${rules[i].right.join(' ')}`,
						item.left,
						item.right[j]
					);
					await addPause();
				}
			}
			if (currentlyRunning != id) return;
			limitHit();
			addPause();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(() => {
		firstFuncs = getSelectionFunctions(/** @type {string}*/ (firstCard?.getSetId()));
		tableElement?.resetTable();
		lltable();
	});
</script>

<SvgLines svgId="follow-svg" bind:this={svgLines}></SvgLines>
<div class="cards-box unit">
	<GrammarCard {rules} bind:loadGrammar></GrammarCard>
	<TableCard
		rows={nt}
		columns={t}
		bind:table
		bind:svgLines
		bind:this={tableElement}
		tableId="ll"
		label="tabela ll(1)"
		hue={colors.blue}
	></TableCard>
	<SetsCard
		setId="follow"
		useNote={false}
		set={followSet}
		hue={colors.blue}
		label={'follow set'}
		bind:this={followCard}
	></SetsCard>
	<SetsCard
		setId="first"
		useNote={false}
		set={firstSet}
		hue={colors.blue}
		label={'first set'}
		bind:this={firstCard}
	></SetsCard>
</div>

<style>
</style>

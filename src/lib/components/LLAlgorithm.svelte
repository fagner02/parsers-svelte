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

	/**@type {SvgLines}*/
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
	let nt = ['S', 'A', 'Bb'];
	let t = ['$', 'a', 'b', 'm', 'c'];

	export function reset() {
		tableElement.resetTable();
		svgLines.setHideOpacity();
		lltable();
	}
	setResetCall(reset);

	async function selectFor(/**@type {string}*/ id) {
		const elem = document.querySelector(id);
		const box = /**@type {HTMLElement}*/ (document.querySelector('#border-selection'));
		const parent = document.querySelector('.steps');
		if (elem === null || box === null || parent === null) return;

		const rect = elem.getBoundingClientRect();
		const parentRect = parent.getBoundingClientRect();

		const height = rect.height + 3;
		const width = rect.width + 10;
		box.style.height = `${height}px`;
		box.style.width = `${width}px`;
		box.style.top = `${rect.y - parentRect.y - 2}px`;
		box.style.left = `${rect.x - parentRect.x - 8}px`;
	}

	async function lltable() {
		const id = newRunningCall();
		try {
			await wait(100);
			await loadGrammar();
			await addPause();
			instruction = 'Since this thing is like that we have add to the stack';

			for (let i = 0; i < $firstSet.length; i++) {
				const item = $firstSet[i];
				const ruleIndex = parseFloat(/**@type {string}*/ (item.note));
				if (item.right.includes('')) {
					const follow = /**@type {import('@/types').SetRow}*/ (
						$followSet.find((x) => x.left === item.left)
					);
					for (let f = 0; f < follow.right.length; f++) {
						if (currentlyRunning != id) return;

						selectFor('#firstset' + item.note);
						await tableElement.addToTable(
							parseFloat(/**@type {string}*/ (item.note)),
							`${item.left} -> ε`,
							item.left,
							follow.right[f]
						);
						await addPause();
					}
				}
				for (let j = 0; j < item.right.length; j++) {
					if (currentlyRunning != id) return;
					if (item.right[j] == '') {
						continue;
					}
					await tableElement.addToTable(
						parseFloat(/**@type {string}*/ (item.note)),
						`${item.left} -> ${rules[ruleIndex].right.join(' ')}`,
						item.left,
						item.right[j]
					);
					await addPause();
				}
			}

			limitHit();
			addPause();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(() => {
		tableElement?.resetTable();
		lltable();
	});
</script>

<div id="border-selection"></div>
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
		color="blue"
	></TableCard>
	<SetsCard setId="follow" useNote={false} set={followSet} color={'blue'} label={'follow set'}
	></SetsCard>
	<SetsCard setId="first" useNote={false} set={firstSet} color={'blue'} label={'first set'}
	></SetsCard>
</div>

<style>
	#border-selection {
		border: 1px solid hsl(0, 0%, 0%);
		position: absolute;
		z-index: 1;
		border-radius: 8px;
	}
</style>

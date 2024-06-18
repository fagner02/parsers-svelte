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
	let t = ['$', 'a', 'b', 'm'];

	export function reset() {
		tableElement.resetTable();

		svgLines.setHideOpacity();
		console.log($table);
		lltable();
	}
	setResetCall(reset);

	async function lltable() {
		const id = newRunningCall();
		try {
			await wait(100);
			await loadGrammar();
			await addPause();
			instruction = 'Since this thing is like that we have add to the stack';

			for (let i = 0; i < $firstSet.length; i++) {
				const item = $firstSet[i];
				for (let j = 0; j < item.right.length; j++) {
					const ruleIndex = parseFloat(/**@type {string}*/ (item.note));
					if (item.right.includes('')) {
						const follow = /**@type {import('@/types').SetRow}*/ (
							$followSet.find((x) => x.left === item.left)
						);
						for (let f = 0; f < follow.right.length; f++) {
							if (currentlyRunning != id) {
								console.log(currentlyRunning, id);
								return;
							}
							await tableElement.addToTable(
								parseFloat(/**@type {string}*/ (item.note)),
								`${item.left} -> ε`,
								item.left,
								follow.right[f]
							);
							await addPause();
						}
						continue;
					}
					if (currentlyRunning != id) {
						console.log(currentlyRunning, id);
						return;
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

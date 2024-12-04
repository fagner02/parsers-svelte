<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import TableCard from '@/Cards/TableCard.svelte';
	import { wait, addPause, limitHit, setResetCall } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import { colors, selectRSymbol } from '$lib/selectSymbol';
	import { getGrammar } from '$lib/utils';
	import PseudoCode from '@/Structures/PseudoCode.svelte';
	import { setInfoComponent } from '$lib/infoText';
	import LL1TableInfo from '@/Info/LL1TableInfo.svelte';

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {PseudoCode | undefined}*/
	let codeCard;
	/**@type {TableCard}*/
	let tableElement;
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<any>>>} */
	export let table = writable(new Map());
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {string}*/
	export let instruction;

	let { nt, t, rules } = getGrammar();
	/**@type {import('svelte/store').Writable<import('@/types').SetRow[]>}*/
	export let firstSet;
	/**@type {import('svelte/store').Writable<import('@/types').SetRow[]>}*/
	export let followSet;

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
		try {
			await wait(100);
			await loadGrammar();
			await addPause();
			instruction = 'Since this thing is like that we have add to the stack';

			await codeCard?.highlightLines([0]);
			for (let i = 0; i < $firstSet.length; i++) {
				await codeCard?.highlightLines([1]);
				const item = $firstSet[i];

				await firstFuncs?.selectFor(`${firstCard?.getSetId()}set${i}`);
				await codeCard?.highlightLines([2]);
				await codeCard?.highlightLines([3]);
				if (item.right.includes('')) {
					await selectRSymbol(/**@type {string}*/ (firstCard?.getSetId()), i, 0, colors.green);
					const followIndex = $followSet.findIndex((x) => x.left === item.left);
					const follow = /**@type {import('@/types').SetRow}*/ ($followSet[followIndex]);
					for (let f = 0; f < follow.right.length; f++) {
						await codeCard?.highlightLines([4]);

						selectRSymbol(
							/**@type {string}*/ (followCard?.getSetId()),
							followIndex,
							f * 2,
							colors.green
						);
						await codeCard?.highlightLines([5]);

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
					await codeCard?.highlightLines([6]);
					await codeCard?.highlightLines([7]);
					if (item.right[j] == '') {
						continue;
					}
					await codeCard?.highlightLines([8]);

					await selectRSymbol(/**@type {string}*/ (firstCard?.getSetId()), i, j * 2, colors.green);

					await tableElement.addToTable(
						parseFloat(/**@type {string}*/ (item.note)),
						`${item.left} -> ${rules[i].right.join(' ')}`,
						item.left,
						item.right[j]
					);
					await addPause();
				}
			}

			limitHit();
			await addPause();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		firstFuncs = getSelectionFunctions(/** @type {string}*/ (firstCard?.getSetId()));
		tableElement?.resetTable();
		fetch('./lltable.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		setInfoComponent(LL1TableInfo);
		lltable();
	});
</script>

<SvgLines svgId="follow-svg" bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit">
		<PseudoCode bind:this={codeCard}></PseudoCode>
	</div>
	<div class="cards-box unit">
		<GrammarCard bind:loadGrammar></GrammarCard>
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
</div>

<style>
</style>

<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { wait, addPause, limitHit, setResetCall } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import { calcNullable } from '$lib/first';
	import { colors, selectLSymbol, selectRSymbol } from '$lib/selectSymbol';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import { getGrammar } from '$lib/utils';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { setInfoComponent } from '$lib/infoText';
	import FistInfo from '@/Info/FistInfo.svelte';

	/**@type {StackCard | undefined}*/
	let joinStackElement;
	/**@type {SetsCard | undefined}*/
	let firstSetElement;
	/**@type {SetsCard | undefined}*/
	let joinSetElement;
	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {PseudoCode | undefined}*/
	let codeCard;

	/**@type {string}*/
	export let instruction;
	let { nt, rules } = getGrammar();
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let joinStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>} */
	export let firstSet = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>} */
	export let joinSet = writable([]);

	/**@type {Map<number,number>}*/
	let firstIndexes = new Map();
	/**@type {Map<number,number>}*/
	let joinIndexes = new Map();

	/**@type {import('@/Cards/selectionFunction').SelectionFunctions | undefined}*/
	let grammarFuncs;

	export const reset = () => {
		joinStack.update(() => []);
		joinSet.update(() => []);
		firstSet.update(() => []);
		svgLines?.setHideOpacity();
		grammarFuncs?.hideSelect();
		firstIndexes.clear();
		joinIndexes.clear();
		codeCard?.reset();
		first();
	};
	setResetCall(reset);

	async function first() {
		try {
			await wait(0);
			await loadGrammar();
			await addPause();
			const nullable = calcNullable(rules);

			instruction = 'Since this thing is like that we have add to the stack';
			await codeCard?.highlightLines([0, 1]);

			for (let i = 0; i < rules.length; i++) {
				await codeCard?.highlightLines([2]);
				await grammarFuncs?.selectFor(`gset${i}`);
				await codeCard?.highlightLines([3, 4]);
				await selectLSymbol('g', i, colors.blue);
				await firstSetElement?.addSetRow(rules[i].left, i, `gl${i}`);
				let isNull = true;
				await addPause();
				for (let j = 0; j < rules[i].right.length; j++) {
					await codeCard?.highlightLines([5]);
					let symbol = rules[i].right[j];
					if (symbol === '') break;
					await codeCard?.highlightLines([6]);
					if (nt.includes(symbol)) {
						await selectRSymbol('g', i, j, colors.blue, false);
						instruction = `Criamos o conjunto join da regra ${i}:${rules[i].left}`;

						if (!joinIndexes.has(i)) {
							await joinSetElement?.addSetRow(rules[i].left, i, `gl${i}`);
						}

						const matchingRules = rules.filter((x) => x.left === symbol);

						await codeCard?.highlightLines([7, 8]);
						await joinSetElement?.joinSets(
							matchingRules.map((x) => x.index),
							matchingRules.map((x) => `${x.left}`),
							matchingRules.map((x) => `${x.index}`),
							i,
							`gr${i}-${j}`
						);
						await codeCard?.highlightLines([9]);
					} else {
						await codeCard?.highlightLines([9]);
						await addPause();
						await selectRSymbol('g', i, j, colors.green, false);
						await codeCard?.highlightLines([10]);

						await firstSetElement?.joinSets([symbol], [symbol], null, i, `gr${i}-${j}`);
					}

					await codeCard?.highlightLines([11]);
					if (!(nullable.get(symbol) ?? false)) {
						await codeCard?.highlightLines([12, 13]);
						isNull = false;
						break;
					}
				}
				await codeCard?.highlightLines([14]);
				if (isNull) {
					await codeCard?.highlightLines([15]);
					if (rules[i].right[0] === '') {
						await selectRSymbol('g', i, 0, colors.green, false);
					}
					await firstSetElement?.joinSets(
						[''],
						[''],
						null,
						i,
						`gr${i}-${rules[i].right.length - 1}`
					);
				}
			}
			grammarFuncs?.hideSelect();

			for (let item of $joinSet.keys()) {
				await codeCard?.highlightLines([17]);
				await codeCard?.highlightLines([18]);
				if ($joinSet[item].right.length === 0) {
					await codeCard?.highlightLines([19]);
					continue;
				}
				await addPause();
				await codeCard?.highlightLines([20, 21]);

				await joinStackElement?.addToStack(
					item,
					rules[item].left,
					'',
					`${joinSetElement?.getSetId()}l${item}`
				);
				await addPause();

				while ($joinStack.length > 0) {
					await codeCard?.highlightLines([22]);
					await codeCard?.highlightLines([23, 24]);
					const topKey = $joinStack[$joinStack.length - 1].data;
					const top = /**@type {Array<number>}*/ (joinSetElement?.get(topKey));
					const topValue = top[0];

					let nextSet = joinSetElement?.get(topValue);
					await codeCard?.highlightLines([25]);
					if (nextSet !== undefined && !(nextSet.length === 0)) {
						await codeCard?.highlightLines([26, 27]);

						await joinStackElement?.addToStack(topValue, rules[topValue].left, topValue.toString());
						await addPause();
						continue;
					}
					await codeCard?.highlightLines([28, 29]);
					const setToJoin = /**@type {Array<String>}*/ (firstSetElement?.get(topValue)).filter(
						(x) => x !== ''
					);

					await firstSetElement?.joinSets(
						setToJoin,
						setToJoin,
						null,
						topKey,
						`${firstSetElement.getSetId()}l${topValue}`
					);
					await addPause();
					await codeCard?.highlightLines([30]);
					await joinSetElement?.remove(topKey, topValue);
					await addPause();
					await codeCard?.highlightLines([31]);
					if (joinSetElement?.get(topKey)?.length === 0) {
						await codeCard?.highlightLines([32]);
						await joinStackElement?.removeFromStack($joinStack.length - 1);
					}
				}
			}

			limitHit();
			await addPause();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		grammarFuncs = getSelectionFunctions('g');
		fetch('./first.txt').then((data) => data.text().then((text) => codeCard?.setPseudoCode(text)));

		setInfoComponent(FistInfo);
		return first();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit">
		<PseudoCode bind:this={codeCard}></PseudoCode>
	</div>
	<div class="unit cards-box">
		<GrammarCard bind:loadGrammar></GrammarCard>
		<SetsCard
			setId="first"
			set={firstSet}
			setIndexes={firstIndexes}
			hue={colors.blue}
			label={'first set'}
			bind:this={firstSetElement}
			bind:svgLines
		></SetsCard>
		<SetsCard
			setId="join"
			set={joinSet}
			setIndexes={joinIndexes}
			hue={colors.blue}
			label={'join set'}
			bind:this={joinSetElement}
			bind:svgLines
		></SetsCard>
		<StackCard
			stack={joinStack}
			stackId="join"
			label="join stack"
			hue={colors.blue}
			bind:this={joinStackElement}
			bind:svgLines
		></StackCard>
	</div>
</div>

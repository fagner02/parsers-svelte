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
	import { stackFloatingWindows } from '$lib/interactiveElem';

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

	let { nt, rules } = getGrammar();
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let joinStack = writable([]);

	/** @type {{id: string, instruction: string, firstSet?: import('svelte/store').Writable<Array<import('@/types').SetRow>>, joinSet?: import('svelte/store').Writable<Array<import('@/types').SetRow>>}} */
	let { id, instruction = $bindable(), firstSet = writable([]), joinSet = writable([]) } = $props();

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
	setResetCall(reset, id);

	async function first() {
		try {
			await loadGrammar();
			await addPause(id);
			const nullable = calcNullable(rules);

			instruction = 'Since this thing is like that we have add to the stack';
			await codeCard?.highlightLines([0]);
			await codeCard?.highlightLines([1]);

			for (let i = 0; i < rules.length; i++) {
				await codeCard?.highlightLines([2]);
				await grammarFuncs?.selectFor(`${id}gset${i}`);
				await codeCard?.highlightLines([3]);
				await codeCard?.highlightLines([4]);
				await selectLSymbol(`${id}g`, i, colors.blue, id);
				await firstSetElement?.addSetRow(rules[i].left, i, `${id}gl${i}`);
				let isNull = true;
				await addPause(id);
				for (let j = 0; j < rules[i].right.length; j++) {
					await codeCard?.highlightLines([5]);
					let symbol = rules[i].right[j];
					if (symbol === '') break;
					await codeCard?.highlightLines([6]);
					if (nt.includes(symbol)) {
						await selectRSymbol(`${id}g`, i, j, colors.blue, id, false);
						instruction = `Criamos o conjunto join da regra ${i}:${rules[i].left}`;

						if (!joinIndexes.has(i)) {
							await joinSetElement?.addSetRow(rules[i].left, i, `${id}gl${i}`);
						}

						const matchingRules = rules.filter((x) => x.left === symbol);

						for (let rule of matchingRules) {
							await codeCard?.highlightLines([7]);
							await codeCard?.highlightLines([8]);
							if (rule.index !== i) {
								await codeCard?.highlightLines([9]);
								await joinSetElement?.joinSets(
									[rule.index],
									[rule.left],
									[rule.index.toString()],
									i,
									`${id}gr${i}-${j}`
								);
							}
						}
						await codeCard?.highlightLines([10]);
					} else {
						await codeCard?.highlightLines([10]);
						await addPause(id);
						await selectRSymbol(`${id}g`, i, j, colors.green, id, false);
						await codeCard?.highlightLines([11]);

						await firstSetElement?.joinSets([symbol], [symbol], null, i, `${id}gr${i}-${j}`);
					}

					await codeCard?.highlightLines([12]);
					if (!(nullable.get(symbol) ?? false)) {
						await codeCard?.highlightLines([13]);
						await codeCard?.highlightLines([14]);
						isNull = false;
						break;
					}
				}
				await codeCard?.highlightLines([15]);
				if (isNull) {
					await codeCard?.highlightLines([16]);
					if (rules[i].right[0] === '') {
						await selectRSymbol(`${id}g`, i, 0, colors.green, id, false);
					}
					await firstSetElement?.joinSets(
						[''],
						[''],
						null,
						i,
						`${id}gr${i}-${rules[i].right.length - 1}`
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
				await addPause(id);
				await codeCard?.highlightLines([20]);
				await codeCard?.highlightLines([21]);

				if (!$joinSet[item].note) {
					continue;
				}
				let ruleIndex = parseInt($joinSet[item].note);

				await joinStackElement?.addToStack(
					ruleIndex,
					rules[ruleIndex].left,
					$joinSet[item].note,
					`${joinSetElement?.getSetId()}l${ruleIndex}`
				);
				await addPause(id);

				while ($joinStack.length > 0) {
					await codeCard?.highlightLines([22]);
					await codeCard?.highlightLines([23]);
					await codeCard?.highlightLines([24]);

					const topKey = $joinStack[$joinStack.length - 1].data;
					const top = /**@type {Array<number>}*/ (joinSetElement?.get(topKey));
					const topValue = top[0];

					let nextSet = joinSetElement?.get(topValue);
					await codeCard?.highlightLines([25]);
					if (
						nextSet !== undefined &&
						!(nextSet.length === 0) &&
						!$joinStack.some((x) => x.data === topValue)
					) {
						await codeCard?.highlightLines([26]);
						await codeCard?.highlightLines([27]);

						await joinStackElement?.addToStack(topValue, rules[topValue].left, topValue.toString());
						await addPause(id);
						continue;
					}
					await codeCard?.highlightLines([28]);
					await codeCard?.highlightLines([29]);
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
					await addPause(id);
					await codeCard?.highlightLines([30]);
					await joinSetElement?.remove(topKey, topValue);
					await addPause(id);
					await codeCard?.highlightLines([31]);
					if (joinSetElement?.get(topKey)?.length === 0) {
						await codeCard?.highlightLines([32]);
						await joinStackElement?.removeFromStack($joinStack.length - 1);
					}
				}
			}

			limitHit(id);
			await addPause(id);
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

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="First" bind:this={codeCard} id="first"></PseudoCode>
	</div>
	<div class="unit cards-box" id="card-box{id}">
		<GrammarCard {id} cardId={id} bind:loadGrammar></GrammarCard>
		<SetsCard
			setId="first{id}"
			set={firstSet}
			setIndexes={firstIndexes}
			hue={colors.blue}
			label={'first set'}
			bind:this={firstSetElement}
			bind:svgLines
			{id}
		></SetsCard>
		<SetsCard
			setId="join{id}"
			set={joinSet}
			setIndexes={joinIndexes}
			hue={colors.blue}
			label={'join set'}
			bind:this={joinSetElement}
			bind:svgLines
			{id}
		></SetsCard>
		<StackCard
			stack={joinStack}
			stackId="join{id}"
			label="join stack"
			hue={colors.blue}
			bind:this={joinStackElement}
			bind:svgLines
			{id}
		></StackCard>
	</div>
</div>

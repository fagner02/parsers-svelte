<script>
	import { wait } from '$lib/flowControl';
	import { charWidth, fontSize, lineHeight, subFontSize } from '$lib/globalStyle';
	import { colors } from '$lib/selectSymbol';
	import { getAugGrammar, getGrammar } from '$lib/utils';
	import CardWrapper from './CardWrapper.svelte';

	export let isAugmented = false;
	/** @type {Array<import('@/types').GrammarItem>} */
	let rules = isAugmented ? getAugGrammar().augRules : getGrammar().rules;
	let opacity = 0;

	export const loadGrammar = async function () {
		return new Promise(async (resolve, reject) => {
			try {
				const rulesElem = /**@type {HTMLElement}*/ document.querySelector(`#${cardId}rules`);
				for (let p of rulesElem?.children ?? []) {
					for (let s of p.children) {
						s.classList.remove('block', 'empty');
					}
				}
				await wait(id, 200);
				opacity = 1;
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	};

	/**
	 * @type {string}
	 */
	export let cardId;
	/** @type {string} */
	export let id;

	export function getCardId() {
		return cardId;
	}
</script>

<CardWrapper
	class="card"
	minHeight={lineHeight}
	minWidth={charWidth}
	label={'gramática'}
	hue={colors.blue}
	{cardId}
	{id}
>
	<div style="opacity: {opacity}; transition: opacity 0.5s;" id="{cardId}rules">
		{#each rules as rule, rulesIndex}
			<p
				style="line-height: {lineHeight}rem; font-size: {fontSize}rem; padding: 0px; width: fit-content"
				id="{cardId}gset{rulesIndex}"
			>
				<span id="{cardId}gl{rulesIndex}"
					><span
						style="font-size: {subFontSize}rem; position: relative;transform: translate(0px, {0.3 *
							fontSize}rem)">{rule.index}</span
					>{rule.left}</span
				>
				<span>{'->'}</span>
				{#if rule.right[0] === ''}
					<span id="{cardId}gr{rulesIndex}-{0}">&#x03B5;</span>
				{:else}
					{#each rule.right as symbol, si}
						<span id="{cardId}gr{rulesIndex}-{si}">{symbol}</span>
					{/each}
				{/if}
			</p>
		{/each}
	</div>
</CardWrapper>

<style>
	#grammar {
		height: fit-content;
		transition:
			max-width 0.5s,
			max-height 0.5s;
		overflow: hidden;
	}
	p {
		white-space: nowrap;
	}
	div > p > span {
		margin: 0px 4px;
	}
</style>

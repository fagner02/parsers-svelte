<script>
	import { wait } from '$lib/flowControl';
	import { charWidth, fontSize, lineHeight, subCharWidth, subFontSize } from '$lib/globalStyle';
	import { colors } from '$lib/selectSymbol';
	import { getGrammar } from '$lib/utils';
	import CardWrapper from './CardWrapper.svelte';

	/** @type {Array<import('@/types').GrammarItem>} */
	let rules = getGrammar().rules;
	let opacity = 0;

	export const loadGrammar = async function () {
		return new Promise(async (resolve, reject) => {
			try {
				const rulesElem = /**@type {HTMLElement}*/ document.querySelector('#rules');
				for (let p of rulesElem?.children ?? []) {
					for (let s of p.children) {
						s.classList.remove('block', 'empty');
					}
				}
				await wait(200);
				opacity = 1;
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	};

	const cardId = 'g';

	export function getCardId() {
		return cardId;
	}
</script>

<CardWrapper
	class="card"
	id={'grammar'}
	minHeight={lineHeight}
	minWidth={charWidth}
	label={'gramática'}
	hue={colors.blue}
	cardId={'g'}
>
	<div style="opacity: {opacity}; transition: opacity 0.5s;" id="rules">
		{#each rules as rule, rulesIndex}
			<p
				style="line-height: {lineHeight}rem; font-size: {fontSize}rem; padding: 0px; width: fit-content"
				id="{cardId}set{rulesIndex}"
			>
				<span id="{cardId}l{rulesIndex}"
					><span
						style="font-size: {subFontSize}rem; position: relative;transform: translate(0px, {0.3 *
							fontSize}rem)">{rule.index}</span
					>{rule.left}</span
				>
				<span>{'->'}</span>
				{#if rule.right[0] === ''}
					<span id="{cardId}r{rulesIndex}-{0}">&#x03B5;</span>
				{:else}
					{#each rule.right as symbol, si}
						<span id="{cardId}r{rulesIndex}-{si}">{symbol}</span>
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

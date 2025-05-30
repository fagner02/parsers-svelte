<script>
	import { wait } from '$lib/flowControl';
	import { charWidth, fontSize, lineHeight, subFontSize } from '$lib/globalStyle';
	import { colors } from '$lib/selectSymbol';
	import { getAugGrammar, getGrammar } from '$lib/utils';
	import CardWrapper from './CardWrapper.svelte';

	/** @type {{isAugmented?: boolean, cardId: string, id: string, loadGrammar?: ()=>Promise<any>}} */
	let { isAugmented = false, loadGrammar = $bindable(), ...props } = $props();

	loadGrammar = async function () {
		return new Promise(async (resolve, reject) => {
			try {
				const rulesElem = /**@type {HTMLElement}*/ document.querySelector(`#${props.cardId}rules`);
				for (let p of rulesElem?.children ?? []) {
					for (let s of p.children) {
						s.classList.remove('block', 'empty');
					}
				}
				await wait(props.id, 200);
				opacity = 1;
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	};

	/** @type {Array<import('@/types').GrammarItem>} */
	let rules = isAugmented ? getAugGrammar().augRules : getGrammar().rules;
	let opacity = $state(0);

	export function getCardId() {
		return props.cardId;
	}
</script>

<CardWrapper
	class="card"
	minHeight={lineHeight}
	minWidth={charWidth}
	label={'gramática'}
	hue={colors.blue}
	cardId={props.cardId}
	id={props.id}
>
	<div style="opacity: {opacity}; transition: opacity 0.5s;" id="{props.cardId}rules">
		{#each rules as rule, rulesIndex}
			<p
				style="line-height: {lineHeight}px; font-size: {fontSize}px; padding: 0px; width: fit-content"
				id="{props.cardId}gset{rulesIndex}"
			>
				<span id="{props.cardId}gl{rulesIndex}"
					><span
						style="font-size: {subFontSize}px; position: relative;transform: translate(0px, {0.3 *
							fontSize}rem)">{rule.index}</span
					>{rule.left}</span
				>
				<span>{'->'}</span>
				{#if rule.right[0] === ''}
					<span id="{props.cardId}gr{rulesIndex}-{0}">&#x03B5;</span>
				{:else}
					{#each rule.right as symbol, si}
						<span id="{props.cardId}gr{rulesIndex}-{si}">{symbol}</span>
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

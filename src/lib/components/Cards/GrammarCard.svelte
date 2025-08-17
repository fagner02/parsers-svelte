<script>
	import { wait } from '$lib/flowControl';
	import { fontSize, subFontSize } from '$lib/globalStyle';
	import { colors } from '$lib/selectSymbol';
	import { augRules, rules } from '$lib/utils';
	import { onMount } from 'svelte';
	import CardWrapper from './CardWrapper.svelte';

	/** @type {{isAugmented?: boolean, cardId: string, labelTooltip?: string, id: string}} */
	let { isAugmented = false, labelTooltip = '', ...props } = $props();

	async function loadGrammar() {
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
	}

	/** @type {Array<import('@/types').GrammarItem>} */
	let grammar = $derived(isAugmented ? augRules : rules);
	let opacity = $state(0);

	export function getCardId() {
		return props.cardId;
	}
	onMount(loadGrammar);
</script>

<CardWrapper
	{labelTooltip}
	class="card"
	label={'gramática'}
	hue={colors.blue}
	cardId={props.cardId}
	id={props.id}
>
	<div style="opacity: {opacity}; transition: opacity 0.5s;" id="{props.cardId}rules">
		{#each grammar as rule, rulesIndex}
			<p
				style="font-size: {fontSize}px; padding: 0px; width: fit-content"
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

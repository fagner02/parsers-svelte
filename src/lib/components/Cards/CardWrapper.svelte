<script>
	import { wait } from '$lib/flowControl';
	import { fontSize } from '$lib/globalStyle';
	import { setSelectionFunctions } from '@/Cards/selectionFunction';
	import { onMount } from 'svelte';

	export let cardId;
	/**@type {HTMLElement}*/
	let selection;

	/** @type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	const selectionFunctions = {
		selectFor: async function (/**@type {string}*/ id) {
			try {
				if (!id.startsWith('#')) {
					id = '#' + id;
				}
				const elem = document.querySelector(id);
				if (elem === null) return;
				const parent = /**@type {HTMLElement}*/ (selection.parentElement);

				const elemRect = elem.getBoundingClientRect();
				const parentRect = parent.getBoundingClientRect();

				selection.style.opacity = '1';
				selection.style.translate = `${elemRect.x - parentRect.x - 16}px ${elemRect.y - parentRect.y - 9}px`;
				selection.style.width = `${elemRect.width + 15}px`;
				selection.style.height = `${elemRect.height + 3}px`;
				await wait(500);
			} catch (e) {
				console.log(e);
			}
		},
		hideSelect: async function () {
			selection.style.opacity = '0';
		}
	};
	setSelectionFunctions(cardId, selectionFunctions);

	onMount(() => {
		selection = /**@type {HTMLElement}*/ (document.querySelector(`#select-${cardId}`));
	});
</script>

<div
	class="grid card-wrapper"
	style="animation: rotA 0.5s;border: 1px solid hsl({$$props.hue}, 40%, 50%);"
>
	<div class="border-selection" id="select-{cardId}"></div>
	<div
		class="card"
		id={$$props.id}
		style="min-height: {$$props.minHeight}rem; min-width:{$$props.minWidth}rem;max-width: {$$props.maxWidth}rem; max-height: {$$props.maxHeight}rem;{$$props.transition
			? `transition: ${$$props.transition}`
			: ''};{$$props.style}"
	>
		<slot></slot>
	</div>
	<div class="card-label" style="background: hsl({$$props.hue},50%,50%);font-size: {fontSize}rem;">
		{$$props.label}
	</div>
</div>

<style>
	.card-label {
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		color: white;
		width: fit-content;
	}

	.card-wrapper {
		flex-direction: column;
		align-items: start;
		border-radius: 15px;
		margin: 5px;
		padding: 5px;
		width: max-content;
		z-index: 0;
	}
	.border-selection {
		grid-area: unit;
	}
	.card {
		grid-area: unit;
		height: fit-content;
		background: white;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		transition: width 0.3s;
		overflow: hidden;
		width: fit-content;

		transition:
			max-width 0.5s,
			max-height 0.5s;
		text-wrap: nowrap;
	}

	.border-selection {
		border: 2px solid hsl(200, 50%, 35%);
		outline: 3px solid white;
		box-shadow: 0px 0px 6px 2px hsl(200, 50%, 0%, 40%);
		border-radius: 8px;
		transition:
			width 0.5s,
			translate 0.5s,
			opacity 0.5s;
		opacity: 0;
		z-index: 1;
	}
</style>

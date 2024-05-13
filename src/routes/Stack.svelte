<script>
	import { wait } from '$lib/textwidth';
	// import './typedefs';
	const stackTransitionForward = `top 0.5s 0.5s, height 0.5s, width 0.5s, opacity 0.5s 0.5s`;
	const stackTransitionBackward = `top 0.5s, height 0.5s 0.5s, width 0.5s 0.5s, opacity 0.5s`;
	/**
	 * @type {number}
	 */
	export let lineHeight;
	export let charWidth;
	export let symbolStack;
	export let fontSize;
	/** @type {string} */
	export let stackId;

	/**
	 * @template T
	 * @param {import("svelte/store").Writable<Array<import('./typedefs').StackItem<T>>>} stack
	 * @param {T} data
	 * @param {string} text
	 * @param {number} width
	 */
	export async function addToStack(stack, data, text, width) {
		stack.update((x) => [
			...x,
			{
				opacity: 0,
				height: 0,
				width: 0,
				top: -lineHeight,
				text,
				data,
				transition: stackTransitionForward
			}
		]);
		await wait(0);

		stack.update((x) => {
			x[x.length - 1] = {
				opacity: 1,
				height: lineHeight,
				width,
				top: 0,
				text,
				data,
				transition: stackTransitionForward
			};
			return x;
		});
		await wait(1000);
	}

	/**
	 * @template T
	 * @param {import("svelte/store").Writable<Array<import('./typedefs').StackItem<T>>>} stack
	 * @param {number} index
	 */
	export async function removeFromStack(stack, index) {
		stack.update((x) => {
			const data = x[index].data;
			const text = x[index].text;
			x[index] = {
				opacity: 0,
				height: 0,
				width: 0,
				top: -lineHeight,
				text,
				data,
				transition: stackTransitionBackward
			};
			return x;
		});
		await wait(1000);
		stack.update((x) => x.splice(0, index));
	}
</script>

<div class="stack-box">
	<div class="stack" style="min-height: {lineHeight}px; min-width: {charWidth}px">
		{#each [...$symbolStack].reverse() as r, index (stackId + r.data)}
			<!-- {#if r.data < rules.length && r. > -1} -->
			<p
				id="rl{index}"
				class="block blue-after"
				style="transition: {r.transition};height: {r.height}px;width: {r.width}px;opacity: {r.opacity}; top: {r.top}px;line-height: {lineHeight}px;font-size:{fontSize}px; padding: 0px;"
			>
				{r.text}
			</p>
			<!-- {/if} -->
		{/each}
	</div>
	<div class="stack-label">symbol stack</div>
</div>

<!-- export types; -->

<style>
	@import 'block.css';
	.stack-box {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
	.stack-label {
		background: hsl(200, 60%, 50%);
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		color: white;
		/* writing-mode: vertical-rl;
		text-orientation: upright;
		letter-spacing: -5px; */
	}
	.stack {
		/* height: 0px; */
		background: white;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		/* width: 0px; */
	}
	.stack > p {
		position: relative;
		transition:
			top 0.5s 0.5s,
			height 0.5s,
			width 0.5s,
			opacity 0.5s 0.5s;
	}
</style>

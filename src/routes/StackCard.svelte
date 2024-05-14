<script>
	import { wait } from '$lib/utils';
	const stackTransitionForward = `top 0.5s 0.5s, height 0.5s, width 0.5s, opacity 0.5s 0.5s`;
	const stackTransitionBackward = `top 0.5s, height 0.5s 0.5s, width 0.5s 0.5s, opacity 0.5s`;
	/**
	 * @type {number}
	 */
	export let lineHeight;
	/**@type {number}*/
	export let charWidth;
	/**@type {number}*/
	export let subCharWidth;

	/**
	 * @type {import("svelte/store").Writable<Array<import('./typedefs').StackItem<any>>>}*/
	export let stack;
	export let fontSize;
	export let subFontSize;
	export let label;
	export let color;
	/** @type {string} */
	export let stackId;

	/**
	 * @param {any} data
	 * @param {string} text
	 * @param {string} note
	 * @param {number} width
	 * @param {string} id
	 */
	export async function addToStack(data, text, note, width, id) {
		stack.update((x) => [
			...x,
			{
				opacity: 0,
				height: 0,
				width: 0,
				top: -lineHeight,
				text,
				note,
				data: data,
				transition: stackTransitionForward,
				id,
				showBlock: true
			}
		]);
		await wait(50);

		stack.update((x) => {
			Object.assign(x[x.length - 1], {
				opacity: 1,
				height: lineHeight,
				width: text.length * charWidth + note.length * subCharWidth,
				top: 0
			});
			return x;
		});
		await wait(1000);
	}

	/**
	 * @param {any} data
	 * @param {string} text
	 * @param {number} index
	 */
	export async function updateItem(data, text, index) {
		stack.update((x) => {
			Object.assign(x[index], { data, text, width: text.length * charWidth, showBlock: false });
			return x;
		});
		await wait(50);

		stack.update((x) => {
			Object.assign(x[index], { data, text, width: text.length * charWidth, showBlock: true });
			return x;
		});
		await wait(500);
	}

	/**
	 * @param {number} index
	 */
	export async function removeFromStack(index) {
		stack.update((x) => {
			Object.assign(x[index], {
				opacity: 0,
				height: 0,
				width: 0,
				top: -lineHeight,
				transition: stackTransitionBackward
			});
			return x;
		});
		await wait(1000);
		stack.update((x) => x.splice(0, index));
	}
</script>

<div class="stack-box">
	<div class="stack" style="min-height: {lineHeight}px; min-width: {charWidth}px">
		{#each [...$stack].reverse() as r, index (stackId + r.id)}
			<p
				id="s-{stackId}-{index}"
				class="{r.showBlock ? 'block' : ''} {color}-after"
				style="transition: {r.transition};height: {r.height}px;width: {r.width}px;opacity: {r.opacity}; top: {r.top}px;line-height: {lineHeight}px;font-size:{fontSize}px; padding: 0px;"
			>
				{r.text}<span style="font-size: {subFontSize}px; position: absolute;translate: 0px 5px"
					>{r.note}</span
				>
			</p>
		{/each}
	</div>
	<div class="stack-label {color}">{label}</div>
</div>

<style>
	@import 'block.css';
	.stack-box {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
	.stack-label {
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		color: white;
	}
	.stack {
		background: white;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
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

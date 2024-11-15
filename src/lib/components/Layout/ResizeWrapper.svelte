<script>
	import { wait } from '$lib/flowControl';
	import MinimizeIcon from '@icons/MinimizeIcon.svelte';
	import { onMount } from 'svelte';

	export let id;
	/**@type {import("$lib/interactiveElem").Interaction}*/
	export let interaction;
	let minimized = false;
	let width = 0;
	let height = 0;

	export let component;

	onMount(() => {
		let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${id}-resize-wrapper`));
		interaction.setResizeInteraction(
			new Map([
				['lb', document.querySelector(`#${id}-lb-handle`)],
				['lt', document.querySelector(`#${id}-lt-handle`)],
				['rb', document.querySelector(`#${id}-rb-handle`)],
				['rt', document.querySelector(`#${id}-rt-handle`)]
			]),
			/**@type {HTMLElement}*/ (wrapper.firstChild?.firstChild)
		);
		interaction.setMoveInteraction(wrapper);
	});
</script>

<div class="grid resize-wrapper" style={$$props.style} id="{id}-resize-wrapper">
	<div class="unit resize-content">
		<slot></slot>
	</div>
	<div class="unit resize-handle lb-handle" id="{id}-lb-handle"></div>
	<div class="unit resize-handle lt-handle" id="{id}-lt-handle"></div>
	<div class="unit resize-handle rb-handle" id="{id}-rb-handle"></div>
	<div class="unit resize-handle rt-handle" id="{id}-rt-handle"></div>
	<div
		class="unit action-tray"
		style="opacity: {minimized ? 0 : 1};width: {minimized ? '0px' : 'fit-content'}"
	>
		<button
			on:click={async () => {
				minimized = true;

				let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${id}-resize-wrapper`));
				let content = /**@type {HTMLElement}*/ (wrapper.firstElementChild);
				width = content.scrollWidth;
				height = content.scrollHeight;
				content.style.width = `${content.scrollWidth}px`;
				content.style.height = `${content.scrollHeight}px`;
				await wait(0);
				content.style.width = '40px';
				content.style.height = '40px';
				/**@type {HTMLElement}*/ (content.firstElementChild).style.opacity = '0';
				for (let handle of /**@type {NodeListOf<HTMLElement>}*/ (
					wrapper.querySelectorAll('.resize-handle')
				)) {
					handle.style.opacity = '0';
				}
			}}><MinimizeIcon></MinimizeIcon></button
		>
	</div>
	{#if minimized}
		<button
			class="unit open-window"
			on:click={async () => {
				minimized = false;

				let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${id}-resize-wrapper`));
				let content = /**@type {HTMLElement}*/ (wrapper.firstElementChild);
				content.style.width = `${width}px`;
				content.style.height = `${height}px`;

				/**@type {HTMLElement}*/ (content.firstElementChild).style.opacity = '1';
				for (let handle of /**@type {NodeListOf<HTMLElement>}*/ (
					wrapper.querySelectorAll('.resize-handle')
				)) {
					handle.style.opacity = '1';
				}
				await wait(500);
				content.style.width = 'unset';
				content.style.height = 'unset';
			}}
		>
			<svelte:component this={component}></svelte:component>
		</button>
	{/if}
</div>

<style>
	.action-tray {
		z-index: 1;
		display: flex;
		justify-self: flex-end;
		height: fit-content;
		width: fit-content;
		margin: 5px;
		gap: 5px;
		transition: opacity 0.5s;
		overflow: hidden;
	}
	.action-tray > button {
		border: 1px solid hsl(0, 0%, 20%);
	}
	@keyframes appear {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.open-window {
		width: fit-content;
		height: fit-content;
		justify-self: center;
		align-self: center;
		border: 1px solid black;
		z-index: 1;
		animation: forwards appear 0.5s;
	}
	.resize-content {
		border: 1px solid hsl(200, 50%, 50%);
		border-radius: 10px;
		background: white;
		transition:
			width 0.5s,
			height 0.5s;
	}
	:global(.resize-content > *) {
		transition: opacity 0.5s;
	}
	.resize-wrapper {
		position: relative;
		width: fit-content;
		height: fit-content;
	}
	.lb-handle {
		cursor: sw-resize;
		align-self: flex-end;
	}
	.lt-handle {
		cursor: nw-resize;
	}
	.rb-handle {
		cursor: se-resize;
		justify-self: flex-end;
		align-self: flex-end;
	}
	.rt-handle {
		cursor: ne-resize;
		justify-self: flex-end;
	}
	.resize-handle {
		width: 15px;
		height: 15px;
		margin: -5px;
		border-radius: 35%;
		border: 1px solid hsl(200, 50%, 50%, 100%);
		background: white;
		z-index: 1;
		transition: opacity 0.5s;
	}
</style>

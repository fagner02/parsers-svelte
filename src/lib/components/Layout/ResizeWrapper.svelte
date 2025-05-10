<script>
	import { wait } from '$lib/flowControl';
	import HandIcon from '@icons/HandIcon.svelte';
	import MinimizeIcon from '@icons/MinimizeIcon.svelte';
	import MoveIcon from '@icons/MoveIcon.svelte';
	import { onMount } from 'svelte';

	/**@type {string?}*/
	export let titleLabel = 'Algoritmo: ';
	/**@type {string?}*/
	export let title = null;
	/**@type {string}*/
	export let id;
	/**@type {import("$lib/interactiveElem").Interaction}*/
	export let interaction;
	export let minimized = true;
	let width = 0;
	let height = 0;
	let selected = 'grab';
	let isInteracting = false;
	/**@type {(()=>void)?}*/
	let removeCallback = null;
	let interactingCallback = (/**@type {boolean}*/ value) => {
		isInteracting = value;
	};

	/** @type {any[]} */
	export let actions = [];

	export let component;

	async function open() {
		minimized = false;

		let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${id}-resize-wrapper`));
		let content = /**@type {HTMLElement}*/ (wrapper.firstElementChild);
		content.style.width = `${width}px`;
		content.style.height = `${height}px`;
		content.style.padding = '0px';
		wrapper.style.overflow = 'unset';

		/**@type {HTMLElement}*/ (content.firstElementChild).style.opacity = '1';
		for (let handle of wrapper.querySelectorAll('.resize-handle')) {
			/**@type {HTMLElement}*/ (handle).style.opacity = '1';
			/**@type {HTMLElement}*/ (handle).style.pointerEvents = 'all';
		}
		await wait(500);
		content.style.width = 'unset';
		content.style.height = 'unset';
		content.style.overflow = 'visible';
		if (selected === 'grab') {
			interaction.removeMoveListeners();
			interaction.attachTransformListeners();
		}
	}

	/**
	 * @param {MouseEvent} e
	 */
	async function close(e) {
		e?.stopImmediatePropagation();

		console.log(document.querySelector('.unit.open-window')?.getBoundingClientRect());
		minimized = true;

		let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${id}-resize-wrapper`));
		let content = /**@type {HTMLElement}*/ (wrapper.firstElementChild);
		width = content.scrollWidth;
		height = content.scrollHeight;
		content.style.width = `${content.scrollWidth}px`;
		content.style.height = `${content.scrollHeight}px`;
		content.style.padding = '5px';
		await wait(0);
		let openButton = document
			.querySelector(`#${id}-resize-wrapper>.open-window`)
			?.getBoundingClientRect();
		content.style.width = `${openButton?.width}px`;
		content.style.height = `${openButton?.height}px`;
		content.style.overflow = 'hidden';
		/**@type {HTMLElement}*/ (content.firstElementChild).style.opacity = '0';
		for (let handle of wrapper.querySelectorAll('.resize-handle')) {
			/**@type {HTMLElement}*/ (handle).style.opacity = '0';
			/**@type {HTMLElement}*/ (handle).style.pointerEvents = 'none';
		}
		await wait(500);
		wrapper.style.overflow = 'hidden';
		interaction.removeTransformListeners();
		interaction.attachMoveListeners();
	}
	export function setSize() {
		let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${id}-resize-wrapper`));
		let content = /**@type {HTMLElement}*/ (wrapper.firstElementChild);
		width = content.scrollWidth;
		height = content.scrollHeight;
	}
	onMount(() => {
		let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${id}-resize-wrapper`));
		wrapper.style.left = '0px';
		wrapper.style.top = '0px';
		interaction.setResizeInteraction(
			new Map([
				['lb', document.querySelector(`#${id}-lb-handle`)],
				['lt', document.querySelector(`#${id}-lt-handle`)],
				['rb', document.querySelector(`#${id}-rb-handle`)],
				['rt', document.querySelector(`#${id}-rt-handle`)]
			]),
			/**@type {HTMLElement}*/ (wrapper.firstChild?.firstChild)
		);
		let content = /**@type {HTMLElement}*/ (wrapper.firstElementChild);
		interaction.setMoveInteraction(content);
		interaction.setInteractingCallback(interactingCallback);
		interaction.removeTransformListeners();
		interaction.attachMoveListeners();

		let openButton = document
			.querySelector(`#${id}-resize-wrapper>.open-window`)
			?.getBoundingClientRect();
		content.style.width = `${openButton?.width}px`;
		content.style.height = `${openButton?.height}px`;
		content.style.padding = '5px';
	});
</script>

<div class="grid resize-wrapper" style={$$props.style} id="{id}-resize-wrapper">
	<div class="unit resize-content">
		<slot name="content"></slot>
	</div>
	<div class="unit resize-handle lb-handle" id="{id}-lb-handle"></div>
	<div class="unit resize-handle lt-handle" id="{id}-lt-handle"></div>
	<div class="unit resize-handle rb-handle" id="{id}-rb-handle"></div>
	<div class="unit resize-handle rt-handle" id="{id}-rt-handle"></div>
	<div
		class="unit action-tray"
		style="opacity: {minimized ? 0 : 1};width: {minimized
			? '0px'
			: 'fit-content'};pointer-events: {isInteracting ? 'none' : 'all'}"
	>
		{#if title}
			<p style="height: {minimized ? '0px' : 'auto'}">{title}</p>
		{/if}
		<button on:click={close}><MinimizeIcon></MinimizeIcon></button>
		<button
			disabled={selected === 'move'}
			on:click={(e) => {
				selected = 'move';
				removeCallback?.();
				interaction.removeTransformListeners();
				interaction.attachMoveListeners();
			}}
		>
			<MoveIcon></MoveIcon></button
		>
		<button
			disabled={selected === 'grab'}
			on:click={(e) => {
				e.stopImmediatePropagation();
				selected = 'grab';
				removeCallback?.();
				interaction.removeMoveListeners();
				interaction.attachTransformListeners();
			}}
			><HandIcon></HandIcon>
		</button>
		{#each actions as action}
			<button
				disabled={selected === action.name}
				on:click={() => {
					removeCallback?.();
					interaction.removeTransformListeners();
					interaction.removeMoveListeners();
					selected = action.name;
					action.callback();
					removeCallback = action.removeCallback;
				}}><svelte:component this={action.icon}></svelte:component></button
			>
		{/each}
	</div>
	{#if minimized}
		<button class="unit open-window" on:click={open}>
			<svelte:component this={component}></svelte:component>

			{#if titleLabel}
				{titleLabel}
			{/if}{#if title}
				{title}
			{/if}
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
	.action-tray > p {
		border-radius: 5px;
		padding: 0px 5px;
		font-size: 0.8rem;
		align-content: center;
		background: white;
		transition: height 0.5s;
	}
	.action-tray > button,
	.action-tray > p {
		border: 1px solid hsl(0, 0%, 20%);
	}
	.action-tray > button:disabled {
		filter: brightness(0.6);
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
		font-size: 0.8rem;
	}
	.resize-content {
		border: 1px solid hsl(200, 50%, 50%);
		border-radius: 10px;
		background: white;
		transition:
			width 0.5s,
			height 0.5s,
			padding 0.5s;
		z-index: 1;
		overflow: hidden;
	}
	:global(.resize-content > *) {
		opacity: 0;
		transition: opacity 0.5s;
	}
	.resize-wrapper {
		position: absolute;
		width: fit-content;
		height: fit-content;
		margin: 5px;
		z-index: 1;
		overflow: hidden;
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
		opacity: 0;
		pointer-events: none;
	}
	.resize-wrapper,
	.resize-handle {
		touch-action: none;
	}
</style>

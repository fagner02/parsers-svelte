<script>
	import { wait } from '$lib/flowControl';
	import { appendData } from '$lib/log';
	import { setUpTooltip } from '$lib/tooltip';
	import HandIcon from '@icons/HandIcon.svelte';
	import MinimizeIcon from '@icons/MinimizeIcon.svelte';
	import MoveIcon from '@icons/MoveIcon.svelte';
	import { onMount } from 'svelte';

	/**@typedef {{icon: import("svelte").Component, desc: string, name: string, callback: ()=>void, removeCallback: ()=>void}} ResizeWrapperAction*/
	/**@type {{
	 * titleLabel?:string?,
	 * title: string?,
	 * id: string,
	 * interaction: import("$lib/interactiveElem").Interaction,
	 * minimized?: boolean,
	 * actions?: ResizeWrapperAction[],
	 * component: any,
	 * content: import('svelte').Snippet,
	 * setSize?: () => void,
	 * style?: string }}*/
	let {
		titleLabel = 'Algoritmo: ',
		actions = [],
		minimized = $bindable(),
		setSize = $bindable(),
		title = null,
		content,
		interaction = $bindable(),
		...props
	} = $props();
	minimized ??= true;
	let width = 0;
	let height = 0;
	let selected = $state('grab');
	let isInteracting = $state(false);
	/**@type {(()=>void)?}*/
	let removeCallback = null;
	let interactingCallback = (/**@type {boolean}*/ value) => {
		isInteracting = value;
	};

	setSize = function () {
		let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${props.id}-resize-wrapper`));
		let content = /**@type {HTMLElement}*/ (wrapper.firstElementChild);
		width = content.scrollWidth;
		height = content.scrollHeight;
	};

	async function open() {
		appendData(`open float, ${props.id}`);
		minimized = false;

		let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${props.id}-resize-wrapper`));
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
		await wait(props.id, 500);
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
		appendData(`close float, ${props.id}`);
		minimized = true;

		let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${props.id}-resize-wrapper`));
		let content = /**@type {HTMLElement}*/ (wrapper.firstElementChild);
		width = content.scrollWidth;
		height = content.scrollHeight;
		content.style.width = `${content.scrollWidth}px`;
		content.style.height = `${content.scrollHeight}px`;
		content.style.padding = '5px';
		await wait(props.id, 0);
		let openButton = document
			.querySelector(`#${props.id}-resize-wrapper>.open-window`)
			?.getBoundingClientRect();
		content.style.width = `${openButton?.width}px`;
		content.style.height = `${openButton?.height}px`;
		content.style.overflow = 'hidden';
		/**@type {HTMLElement}*/ (content.firstElementChild).style.opacity = '0';
		for (let handle of wrapper.querySelectorAll('.resize-handle')) {
			/**@type {HTMLElement}*/ (handle).style.opacity = '0';
			/**@type {HTMLElement}*/ (handle).style.pointerEvents = 'none';
		}
		await wait(props.id, 500);
		wrapper.style.overflow = 'hidden';
		interaction.removeTransformListeners();
		interaction.attachMoveListeners();
	}

	onMount(() => {
		let wrapper = /**@type {HTMLElement}*/ (document.querySelector(`#${props.id}-resize-wrapper`));

		interaction.setResizeInteraction(
			new Map([
				['lb', document.querySelector(`#${props.id}-lb-handle`)],
				['lt', document.querySelector(`#${props.id}-lt-handle`)],
				['rb', document.querySelector(`#${props.id}-rb-handle`)],
				['rt', document.querySelector(`#${props.id}-rt-handle`)]
			]),
			/**@type {HTMLElement}*/ (wrapper.firstChild?.firstChild)
		);
		let content = /**@type {HTMLElement}*/ (wrapper.firstElementChild);
		interaction.setMoveInteraction(content);
		interaction.setInteractingCallback(interactingCallback);
		interaction.removeTransformListeners();
		interaction.attachMoveListeners();

		let openButton = document
			.querySelector(`#${props.id}-resize-wrapper>.open-window`)
			?.getBoundingClientRect();
		content.style.width = `${openButton?.width}px`;
		content.style.height = `${openButton?.height}px`;
		content.style.padding = '5px';
	});
</script>

<div class="grid resize-wrapper" style={props.style} id="{props.id}-resize-wrapper">
	<div class="unit resize-content">
		{@render content()}
	</div>
	<div class="unit resize-handle lb-handle" id="{props.id}-lb-handle"></div>
	<div class="unit resize-handle lt-handle" id="{props.id}-lt-handle"></div>
	<div class="unit resize-handle rb-handle" id="{props.id}-rb-handle"></div>
	<div class="unit resize-handle rt-handle" id="{props.id}-rt-handle"></div>
	<div
		class="unit action-tray"
		style="opacity: {minimized ? 0 : 1};width: {minimized
			? '0px'
			: 'fit-content'};pointer-events: {isInteracting ? 'none' : 'all'}"
	>
		{#if title}
			<p style="height: {minimized ? '0px' : 'auto'}">{title}</p>
		{/if}
		<button use:setUpTooltip={'Minimizar'} onclick={close}><MinimizeIcon></MinimizeIcon></button>
		<button
			use:setUpTooltip={'Mover janela flutuante'}
			disabled={selected === 'move'}
			onclick={() => {
				appendData(`move float, ${props.id}`);
				selected = 'move';
				removeCallback?.();
				interaction.removeTransformListeners();
				interaction.attachMoveListeners();
			}}
		>
			<MoveIcon></MoveIcon></button
		>
		<button
			use:setUpTooltip={'Habilitar interação'}
			disabled={selected === 'grab'}
			onclick={(/**@type {PointerEvent}*/ e) => {
				appendData(`grab float, ${props.id}`);
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
				use:setUpTooltip={action.desc}
				disabled={selected === action.name}
				onclick={() => {
					removeCallback?.();
					interaction.removeTransformListeners();
					interaction.removeMoveListeners();
					selected = action.name;
					action.callback();
					removeCallback = action.removeCallback;
				}}><action.icon /></button
			>
		{/each}
	</div>
	{#if minimized}
		<button class="unit open-window" onclick={open}>
			<props.component />

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
		opacity: 0;
		transition: opacity 0.5s;
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

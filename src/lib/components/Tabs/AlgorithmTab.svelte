<script>
	import {
		wait,
		reset,
		forward,
		back,
		setCloseInstruction,
		setOpenInstruction,
		swapAlgorithm,
		setLimitHitCallback,
		skipToEnd
	} from '$lib/flowControl';
	import Code from '@/Layout/Code.svelte';
	import FillSize from '@/Layout/FillSize.svelte';
	import ClipboardTextIcon from '@icons/ClipboardTextIcon.svelte';
	import CodeIcon from '@icons/CodeIcon.svelte';
	import DocIcon from '@icons/DocIcon.svelte';
	import PlayIcon from '@icons/PlayIcon.svelte';
	import PlaySkipBackIcon from '@icons/PlaySkipBackIcon.svelte';
	import PlaySkipForwardIcon from '@icons/PlaySkipForwardIcon.svelte';
	import RestartIcon from '@icons/RestartIcon.svelte';
	import ResultText from '@/Layout/ResultText.svelte';
	import Info from '@/Layout/Info.svelte';
	import InputStringIcon from '@icons/InputStringIcon.svelte';
	import InfoIcon from '@icons/InfoIcon.svelte';
	import ParseView from '@/ParseView.svelte';
	import ForwardIcon from '@icons/ForwardIcon.svelte';
	import { isGrammarLoaded } from '$lib/utils';

	let animIn = 'rotA 0.5s';
	let animOut = 'rotD 0.5s forwards';
	let animation = animIn;

	// ============== flow control ==================================
	/** @type {boolean} */
	let limit = false;
	// ============== flow control ==================================

	let parseOn = false;
	/** @type {string} */
	export let code;

	/** @param {string} name */
	async function updateSelected(name) {
		animation = '';
		await wait(10);

		animation = animIn;
		selected = name;
	}

	let scale = 0.5;
	let opacity = 0;
	let pos = 50;
	let contentPos = -50;
	let contentOpacity = 0;
	export let instruction = '';

	async function closePopup() {
		animation = animOut;

		await wait(500);
		selected = 'noPopup';
	}

	export async function openInstruction() {
		try {
			scale = 1;
			opacity = 1;
			pos = 0;
			await wait(200);

			contentOpacity = 1;
			contentPos = 0;
			await wait(300);
		} catch {}
	}

	export async function closeInstruction() {
		try {
			contentOpacity = 0;
			contentPos = 50;

			await wait(100);

			scale = 0.5;
			opacity = 0;
			pos = 50;
			await wait(300);
		} catch {}
	}

	/**
	 * @param {boolean} value
	 */
	function limitHitCallback(value) {
		limit = value;
	}

	setLimitHitCallback(limitHitCallback);
	setCloseInstruction(closeInstruction);
	setOpenInstruction(openInstruction);

	let selected = 'noPopup';
	$: isAnim = selected === 'noPopup';
</script>

<FillSize class="contents">
	<div class="controls-box">
		<div class="controls">
			<button
				class="popup-button"
				on:click={() => updateSelected('code')}
				disabled={selected == 'code'}
			>
				<CodeIcon color="hsl(100,50%,100%)" strokeWidth={3}></CodeIcon>
			</button>
			<button
				class="popup-button"
				on:click={() => updateSelected('text')}
				disabled={selected == 'text'}
			>
				<ClipboardTextIcon color="hsl(100,50%,100%)" strokeWidth={3}></ClipboardTextIcon>
			</button>
			<button
				class="popup-button"
				on:click={() => updateSelected('info')}
				disabled={selected == 'info'}
			>
				<DocIcon color="hsl(100,50%,100%)" strokeWidth={3}></DocIcon>
			</button>
			<button
				class="view-button"
				on:click={() => {
					reset();
					swapAlgorithm();
					parseOn = true;
					closePopup();
				}}
				disabled={parseOn}
			>
				<InputStringIcon color="hsl(100,50%,100%)" strokeWidth={3}></InputStringIcon>
			</button>
			<button
				class="view-button"
				on:click={() => {
					reset();
					swapAlgorithm();
					parseOn = false;
					closePopup();
				}}
				disabled={!parseOn}
			>
				<PlayIcon color="hsl(100,50%,100%)" strokeWidth={3}></PlayIcon>
			</button>
		</div>

		<div class="flow-controls controls">
			<button on:click={back}>
				<PlaySkipBackIcon color="hsl(200,60%,100%)" size={15} strokeWidth={3} />
			</button>
			<button on:click={reset}>
				<RestartIcon color="hsl(200,60%,100%)" size={15} strokeWidth={3}></RestartIcon>
			</button>
			<button disabled={limit} on:click={forward}>
				<PlaySkipForwardIcon color="hsl(200,60%,100%)" size={15} strokeWidth={3} />
			</button>
			<button disabled={limit} on:click={skipToEnd}>
				<ForwardIcon color="hsl(200,60%,100%)" size={15} strokeWidth={3}></ForwardIcon>
			</button>
		</div>
	</div>
	{#if isGrammarLoaded()}
		<FillSize id="wrapper" class="grid maxWidth">
			<div class="unit" style="height: inherit;max-width: inherit;z-index: 1">
				{#if parseOn}
					<ParseView>
						<slot name="tree" slot="tree"></slot>
						<slot name="parse" slot="parse"></slot>
					</ParseView>
				{:else}
					<div class="steps {$$props.class ?? ''}" style="position: relative;">
						<slot name="steps"></slot>
					</div>
				{/if}
			</div>
			<div
				class="popup unit"
				style="animation: {animation}; display:{isAnim ? 'none' : 'flex'};height:inherit;"
			>
				{#if selected === 'code'}
					<Code {code} onClose={closePopup}></Code>
				{:else if selected === 'text'}
					<ResultText onClose={closePopup}></ResultText>
				{:else if selected === 'info'}
					<Info onClose={closePopup}></Info>
				{/if}
			</div>
			<div class="unit instruction-box">
				<div
					class="instruction"
					style="opacity: {opacity};transform: translate(0, {pos}px) scale({scale})"
				>
					<div
						class="instruction-content"
						style="transform:translate(0, {contentPos}px);opacity: {contentOpacity}"
					>
						<InfoIcon
							color="hsl(200, 70%,40%)"
							strokeWidth={3}
							size={18}
							style="top: 4px;position: relative;"
						></InfoIcon>
						<span style="height: 18px;">{instruction}</span>
					</div>
				</div>
			</div>
		</FillSize>
	{:else}
		Nonw
	{/if}
</FillSize>

<style>
	:global(.popup) {
		z-index: 2;
	}
	:global(.contents) {
		display: flex;
		justify-content: start;
		align-items: start;
		flex-direction: column;
	}

	:global(.instruction-box) {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		pointer-events: none;
		height: inherit;
	}

	.instruction {
		background: white;
		border-radius: 10px;
		box-shadow: 0px 0px 10px 0px hsl(0, 0%, 0%, 20%);
		padding: 5px 10px;
		z-index: 1;
		overflow: hidden;
		transition: all 0.3s;
		font-size: 12px;
		border: 1px solid hsl(200, 60%, 60%);
		pointer-events: visible;
	}

	.instruction-content {
		transition: all 0.1s;
		position: relative;
		top: -3px;
	}

	.controls-box {
		display: flex;
		gap: 10px;
		margin: 5px;
		justify-content: space-between;
		min-height: fit-content;
		flex-wrap: wrap;
		width: 100%;
		width: -webkit-fill-available;
		width: -moz-available;
	}

	.controls {
		display: flex;
		gap: 10px;
		height: fit-content;
	}

	.flow-controls {
		justify-content: center;
	}

	.steps {
		display: flex;
		justify-content: start;
		align-items: center;
		flex-wrap: wrap;
		flex-direction: column;
		max-width: inherit;
		height: inherit;
		border: 1px solid hsl(0, 0%, 0%, 20%);
		border-radius: 10px;
		overflow: auto;
	}

	:global(.steps > div) {
		margin-top: 5px;
	}

	button {
		box-shadow: 0px 0px 5px 0px hsl(200, 100%, 40%, 30%);
		border: 1px solid hsl(200, 60%, 40%);
		background: hsl(200, 100%, 45%);
		transition:
			filter 0.5s,
			scale 0.1s,
			background 0.5s;
		scale: 1;
	}

	.view-button {
		box-shadow: 0px 0px 5px 0px hsl(100, 100%, 40%, 30%);
		border: 1px solid hsl(100, 60%, 40%);
		background: hsl(100, 60%, 45%);
	}
	button:active {
		transform: scale(1.2);
	}
	button:disabled {
		transform: scale(1);
		background: hsl(200, 50%, 70%);
	}
	.view-button:disabled {
		background: hsl(100, 50%, 70%);
	}
</style>

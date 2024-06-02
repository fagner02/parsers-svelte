<script>
	import { wait } from '$lib/utils';
	import Code from '@/Code.svelte';
	import FillHeight from '@/FillHeight.svelte';
	import ClipboardTextIcon from '@icons/ClipboardTextIcon.svelte';
	import CodeIcon from '@icons/CodeIcon.svelte';
	import DocIcon from '@icons/DocIcon.svelte';
	import PlayIcon from '@icons/PlayIcon.svelte';
	import PlaySkipBackIcon from '@icons/PlaySkipBackIcon.svelte';
	import PlaySkipForwardIcon from '@icons/PlaySkipForwardIcon.svelte';
	import RestartIcon from '@icons/RestartIcon.svelte';
	import StepsView from '@/StepsView.svelte';
	import ResultText from '@/ResultText.svelte';
	import Info from '@/Info.svelte';
	import InputStringIcon from '@icons/InputStringIcon.svelte';
	import InfoIcon from '@icons/InfoIcon.svelte';
	import ParseView from '@/ParseView.svelte';

	let animIn = 'rotA 0.5s';
	let animOut = 'rotD 0.5s forwards';
	let animation = animIn;

	// ============== flow control ==================================
	/** @type {() => Promise<void>} */
	let forward;
	/** @type {() => void} */
	let back;
	/** @type {() => void} */
	let reset;
	/** @type {boolean} */
	let animating;
	/** @type {() => void} */
	export let limitHit;
	/** @type {() => Promise<void>}*/
	export let addPause;
	/** @type {() => void}*/
	export let resetCall;
	/** @type {any}*/
	export let swapAlgorithm;
	// ============== flow control ==================================

	let parseOn = false;
	/** @type {string} */
	export let code;
	/**@type {string}*/
	export let inputString;
	/**@type {string}*/
	export let selectedAlgorithm;

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
			await wait(400);

			contentOpacity = 1;
			contentPos = 0;
			await wait(500);
		} catch {}
	}

	export async function closeInstruction() {
		try {
			contentOpacity = 0;
			contentPos = 50;

			await wait(200);

			scale = 0.5;
			opacity = 0;
			pos = 50;
			await wait(500);
		} catch {}
	}

	let selected = 'noPopup';
	$: isAnim = selected === 'noPopup';
</script>

<FillHeight class="contents">
	<div class="controls-box">
		<div class="controls">
			<button on:click={() => updateSelected('code')} disabled={selected == 'code'}>
				<CodeIcon></CodeIcon>
			</button>
			<button on:click={() => updateSelected('text')} disabled={selected == 'text'}>
				<ClipboardTextIcon></ClipboardTextIcon>
			</button>
			<button on:click={() => updateSelected('info')} disabled={selected == 'info'}>
				<DocIcon></DocIcon>
			</button>
			<button
				on:click={() => {
					parseOn = true;
					closePopup();
				}}
				disabled={parseOn}
			>
				<InputStringIcon></InputStringIcon>
			</button>
			<button
				on:click={() => {
					parseOn = false;
					closePopup();
				}}
				disabled={!parseOn}
			>
				<PlayIcon></PlayIcon>
			</button>
		</div>
		{#if !parseOn}
			<div class="flow-controls controls">
				<button style="filter: brightness({animating ? 80 : 100}%);" on:click={back}>
					<PlaySkipBackIcon color="hsl(200,60%,50%)" size={15} strokeWidth={3} />
				</button>
				<button on:click={reset} style="filter: brightness({animating ? 80 : 100}%);">
					<RestartIcon color="hsl(200,60%,50%)" size={15} strokeWidth={3}></RestartIcon>
				</button>
				<button on:click={forward} style="filter: brightness({animating ? 80 : 100}%);">
					<PlaySkipForwardIcon color="hsl(200,60%,50%)" size={15} strokeWidth={3} />
				</button>
			</div>
		{/if}
	</div>
	<FillHeight id="wrapper" class="grid maxWidth">
		<div class="unit" style="height: inherit;max-width: inherit;z-index: 1">
			{#if parseOn}
				<ParseView bind:inputString>
					<slot name="parse"></slot>
				</ParseView>
			{:else}
				<StepsView
					bind:back
					bind:forward
					bind:reset
					bind:addPause
					bind:limitHit
					bind:animating
					bind:swapAlgorithm
					{resetCall}
					{closeInstruction}
					{openInstruction}
				>
					<slot name="steps"></slot>
				</StepsView>
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
			<div class="instruction" style="opacity: {opacity};translate: 0 {pos}px;scale: {scale}">
				<div
					class="instruction-content"
					style="translate: 0 {contentPos}px;opacity: {contentOpacity}"
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
	</FillHeight>
</FillHeight>

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
		transition: all 0.5s;
		font-size: 12px;
		border: 1px solid hsl(200, 60%, 60%);
		pointer-events: visible;
	}

	.instruction-content {
		transition: all 0.5s;
		position: relative;
		top: -3px;
	}

	.controls-box {
		display: flex;
		gap: 10px;
		margin: 5px;
		justify-content: space-between;
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

	button {
		box-shadow: 0px 0px 5px 0px hsl(200, 100%, 40%, 30%);
		border: 1px solid hsl(200, 60%, 60%);
		background: hsl(200, 100%, 95%);
		transition:
			filter 0.5s,
			scale 0.1s;
	}
	button:active {
		scale: 1.2;
	}
	button:disabled {
		scale: 1;
		filter: brightness(80%);
	}
</style>

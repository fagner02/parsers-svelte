<script>
	import { wait } from '$lib/utils';
	import Code from '../Code.svelte';
	import FillHeightWrapper from '../FillHeightWrapper.svelte';
	import ClipboardTextIcon from '@icons/ClipboardTextIcon.svelte';
	import CodeIcon from '@icons/CodeIcon.svelte';
	import DocIcon from '@icons/DocIcon.svelte';
	import PlayIcon from '@icons/PlayIcon.svelte';
	import PlaySkipBackIcon from '@icons/PlaySkipBackIcon.svelte';
	import PlaySkipForwardIcon from '@icons/PlaySkipForwardIcon.svelte';
	import RestartIcon from '@icons/RestartIcon.svelte';
	import StepsView from '../StepsView.svelte';
	import ResultText from '../ResultText.svelte';
	import Info from '../Info.svelte';

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
	/** @type {() => Promise<void>} */
	export let addPause;
	/** @type {() => void}*/
	export let resetCall;
	// ============== flow control ==================================

	/** @type {string} */
	export let code;

	/**
	 * @param {string} name
	 */
	async function updateSelected(name) {
		animation = '';
		await wait(10);

		animation = animIn;
		selected = name;
	}

	let selected = 'anim';
	$: isAnim = selected === 'anim';
</script>

<div class="contents fill">
	<div class="controls-box">
		<div class="controls">
			<button on:click={() => updateSelected('code')}><CodeIcon></CodeIcon></button>
			<button on:click={() => updateSelected('text')}
				><ClipboardTextIcon></ClipboardTextIcon></button
			>
			<button on:click={() => updateSelected('info')}><DocIcon></DocIcon></button>
			<button
				on:click={async () => {
					animation = animOut;
					await wait(500);
					selected = 'anim';
				}}><PlayIcon></PlayIcon></button
			>
		</div>
	</div>
	<div id="wrapper" class="grid maxHeight maxWidth">
		<div class="unit">
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
			<StepsView
				{resetCall}
				bind:back
				bind:forward
				bind:reset
				bind:addPause
				bind:limitHit
				bind:animating
			>
				<slot></slot>
			</StepsView>
		</div>
		<FillHeightWrapper
			class="popup unit"
			style="animation: {animation}; display:{isAnim ? 'none' : 'flex'}"
		>
			{#if selected === 'code'}
				<Code {code}></Code>
			{:else if selected === 'text'}
				<ResultText></ResultText>
			{:else if selected === 'info'}
				<Info></Info>
			{/if}
		</FillHeightWrapper>
	</div>
</div>

<style>
	@keyframes rit {
		from {
			rotate: 50deg;
		}
		to {
			rotate: 0deg;
		}
	}

	#wrapper {
		transition:
			max-width 0.5s,
			width 0.5s,
			opacity 0.5s;
	}
	:global(.popup) {
		z-index: 2;
	}
	:global(.contents) {
		display: flex;
		justify-content: start;
		align-items: start;
		flex-direction: column;
	}

	.controls-box {
		display: flex;
		gap: 10px;
		margin: 5px;
		justify-content: space-between;
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
		padding: 5px 0px;
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
</style>
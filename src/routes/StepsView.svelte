<script>
	import {
		getPauseResolvesLength,
		setJumpPause,
		setJumpWait,
		killAllWaits,
		killPause,
		pause,
		resolveAllWaits,
		resolvePause
	} from '$lib/utils';
	import PlaySkipBack from './Icons/PlaySkipBack.svelte';
	import Restart from './Icons/Restart.svelte';
	import PlaySkipForward from './Icons/PlaySkipForward.svelte';

	let animating = false;
	let targetStep = -1;
	let stepCount = 0;
	let goForward = false;
	let goBack = false;
	let limit = false;

	export function limitHit() {
		goForward = false;
		animating = false;
		limit = true;
	}

	export async function addPause() {
		stepCount += 1;
		if (goBack && stepCount === targetStep) {
			goBack = false;
			targetStep = -1;
			setJumpPause(false);
			setJumpWait(false);
		} else if (goForward) {
			goForward = false;
			setJumpWait(false);
		}

		animating = false;
		try {
			await pause();
		} catch {}
		animating = true;
	}

	async function forward() {
		if (limit) return;
		goForward = true;

		if (getPauseResolvesLength() > 0) {
			resolvePause();
			return;
		}

		setJumpWait(true);
		resolveAllWaits();
	}

	function back() {
		if (stepCount <= 1) return;
		goBack = true;
		targetStep = stepCount - 1;
		setJumpWait(true);
		setJumpPause(true);
		reset();
	}

	function reset() {
		limit = false;
		stepCount = 0;
		killAllWaits();
		killPause();
		resetCall();
	}

	export let resetCall = () => {
		console.log('not set');
	};
</script>

<div class="steps {$$props.class}" style="position: relative;">
	{stepCount}
	<div>
		<div class="controls-box">
			<div class="controls">
				<button>ni</button>
			</div>
			<div class="controls">
				<button style="filter: brightness({animating ? 80 : 100}%);" on:click={back}>
					<PlaySkipBack color="hsl(200,60%,50%)" size={15} strokeWidth={3} />
				</button>
				<button on:click={reset} style="filter: brightness({animating ? 80 : 100}%);">
					<Restart color="hsl(200,60%,50%)" size={15} strokeWidth={3}></Restart>
				</button>
				<button on:click={forward} style="filter: brightness({animating ? 80 : 100}%);">
					<PlaySkipForward color="hsl(200,60%,50%)" size={15} strokeWidth={3} />
				</button>
			</div>
		</div>
		<slot></slot>
	</div>
</div>

<style>
	.steps {
		display: flex;
		justify-content: start;
		align-items: center;
		flex-wrap: wrap;
		flex-direction: column;
	}

	.controls-box {
		display: flex;
		gap: 10px;
		margin: 5px;
		justify-content: space-between;
	}

	.controls {
		display: flex;
		gap: 10px;
		height: fit-content;
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

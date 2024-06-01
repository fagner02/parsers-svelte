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

	export let animating = false;
	/** @type {() => Promise<void>} */
	export let closeInstruction;
	/** @type {() => Promise<void>} */
	export let openInstruction;
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

	export async function forward() {
		if (limit) return;
		goForward = true;

		if (stepCount > 1) await closeInstruction();
		if (getPauseResolvesLength() > 0) {
			resolvePause();
			openInstruction();
			return;
		}

		setJumpWait(true);
		resolveAllWaits();
	}

	export function back() {
		if (stepCount <= 1) return;
		goBack = true;
		targetStep = stepCount - 1;
		setJumpWait(true);
		setJumpPause(true);
		reset();
	}

	export function reset() {
		limit = false;
		stepCount = 0;
		setJumpWait(true);
		closeInstruction();
		setJumpWait(false);
		killAllWaits();
		killPause();
		resetCall();
	}

	export let resetCall = () => {};
</script>

<div class="steps {$$props.class ?? ''}" style="position: relative;">
	<slot></slot>
</div>

<style>
	.steps {
		display: flex;
		justify-content: start;
		align-items: center;
		flex-wrap: wrap;
		flex-direction: column;
	}
</style>

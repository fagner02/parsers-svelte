/** @type {Map<number, (reason?: any) => void>} */
let pauseResolves = new Map();
/** @type {Map<number, {error: Error,func:(reason?: any) => void}>} */
let pauseRejects = new Map();

/** @type {Map<number, (reason?: any) => void>} */
let waitRejects = new Map();
/** @type {Map<number, any>} */
let waitRe = new Map();
/** @type {Map<number, (reason?: any) => void>} */
let waitResolves = new Map();

let waitCount = 0;
let pauseCount = 0;

let jumpWait = false;
let jumpPause = false;

/**
 * @param {boolean} value
 */
export function setJumpWait(value) {
	jumpWait = value;
}

/**
 * @param {boolean} value
 */
export function setJumpPause(value) {
	jumpPause = value;
}

export function getJumpPause() {
	return jumpPause;
}

export function getJumpWait() {
	return jumpWait;
}

/**
 * @param {number} ms
 */
export async function wait(ms) {
	if (jumpWait) return;
	return new Promise((resolve, reject) => {
		const index = waitCount;
		waitRejects.set(waitCount, reject);
		waitRe.set(waitCount, Error('wait rejected'));
		waitResolves.set(waitCount, resolve);
		waitCount++;
		setTimeout(() => {
			return resolve(index);
		}, ms);
	});
}

/**
 * @param {number} ms
 */
export async function noJumpWait(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve, ms);
	});
}

export function resolvePause() {
	for (let resolve of pauseResolves.values()) {
		resolve();
	}
	pauseResolves.clear();
	pauseRejects.clear();
	pauseCount = 0;
}
export function killPause() {
	for (let reject of pauseRejects.values()) {
		reject.func(reject.error);
	}
	pauseResolves.clear();
	pauseRejects.clear();
	pauseCount = 0;
}

export function resolveAllWaits() {
	for (let resolve of waitResolves.values()) {
		resolve();
	}
	waitCount = 0;
	waitResolves.clear();
	waitRejects.clear();
}
export function killAllWaits() {
	for (let [i, reject] of waitRejects) {
		reject(waitRe.get(i));
	}
	waitCount = 0;
	waitResolves.clear();
	waitRejects.clear();
}
// export let animating = false;
/** @type {() => Promise<void>} */
let closeInstruction;
/** @type {() => Promise<void>} */
let openInstruction;
/** @type {() => void}*/
let resetCall;

/**
 * @param {() => Promise<void>} _closeInstruction
 */
export function setCloseInstruction(_closeInstruction) {
	closeInstruction = _closeInstruction;
}

/**
 * @param {() => Promise<void>} _openInstruction
 */
export function setOpenInstruction(_openInstruction) {
	openInstruction = _openInstruction;
}

/**
 * @param {() => void} _resetCall
 */
export function setResetCall(_resetCall) {
	limit = false;
	stepCount = 0;
	jumpWait = false;
	jumpPause = false;
	maxStep = -1;

	resetCall = _resetCall;
}

let targetStep = -1;
let stepCount = 0;
let maxStep = -1;
let goForward = false;
let goBack = false;
let limit = false;

export function limitHit() {
	goForward = false;
	// animating = false;
	limit = true;
	maxStep = stepCount;

	targetStep = -1;
	stepCount = 0;
}

export async function addPause() {
	return new Promise(async (resolve, reject) => {
		stepCount += 1;

		if (goBack && (stepCount === targetStep || limit)) {
			goBack = false;
			targetStep = -1;
			jumpPause = false;
			jumpWait = false;
		} else if (goForward) {
			goForward = false;
			jumpWait = false;
		}

		if (jumpPause) return resolve(null);

		pauseResolves.set(pauseCount, resolve);
		pauseRejects.set(pauseCount, { func: reject, error: Error('pause rejected') });
		pauseCount++;
	});
	// animating = true;
}

export async function forward() {
	if (limit) return;
	goForward = true;

	if (stepCount > 1) {
		closeInstruction?.();
		await wait(200);
	}
	if (pauseResolves.size > 0) {
		resolvePause();
		openInstruction?.();
		return;
	}

	jumpWait = true;
	resolveAllWaits();
}

export function back() {
	if (stepCount <= 1 && !limit) return;
	goBack = true;
	goForward = false;
	targetStep = limit ? maxStep : stepCount - 1;
	limit = false;
	jumpWait = true;
	jumpPause = true;
	reset();
}

export function reset() {
	limit = false;
	stepCount = 0;
	killAllWaits();
	killPause();
	jumpWait = true;
	closeInstruction?.();
	if (!goBack) {
		targetStep = -1;
		jumpWait = false;
		jumpPause = false;
	}

	resetCall();
}

export function swapAlgorithm() {
	limit = false;
	stepCount = 0;
	killAllWaits();
	killPause();
	jumpWait = false;
	jumpPause = false;
	targetStep = -1;
	goBack = false;
	goForward = false;
	closeInstruction?.();
}

/**@type {number} */
export let currentlyRunning = -1;
let runningCount = 0;

export function newRunningCall() {
	currentlyRunning = runningCount;
	runningCount++;
	if (runningCount > 100) {
		runningCount = 0;
	}
	return currentlyRunning;
}

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
	currentStep = 0;
	jumpWait = false;
	jumpPause = false;
	maxStep = -1;

	resetCall = _resetCall;
}
const actions = { none: -1, forward: 0, skipping: 1, back: 2 };
let targetStep = -1;
let currentStep = 0;
let maxStep = -1;
let action = actions.none;
let limit = false;
/**@type {((value: boolean) => void)?}*/
let limitHitCallback;
export function limitHit() {
	limitHitCallback?.(true);
	limit = true;
	maxStep = currentStep;

	targetStep = -1;
	currentStep = 0;
}

/**
 * @param {(value:boolean)=>void} callback
 */
export function setLimitHitCallback(callback) {
	limitHitCallback = callback;
}

export async function addPause() {
	return new Promise(async (resolve, reject) => {
		currentStep += 1;
		if (action === actions.skipping && limit) {
			action = actions.none;
			jumpPause = false;
			jumpWait = false;
		}
		if (action === actions.back && (currentStep === targetStep || limit)) {
			action = actions.none;
			targetStep = -1;
			jumpPause = false;
			jumpWait = false;
		}
		if (action === actions.forward) {
			action = actions.none;
			jumpWait = false;
		}

		if (jumpPause) return resolve(null);

		pauseResolves.set(pauseCount, resolve);
		pauseRejects.set(pauseCount, { func: reject, error: Error('pause rejected') });
		pauseCount++;
	});
}

export async function forward() {
	if (limit) return;
	action = actions.forward;

	if (currentStep > 1) {
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

export async function skipToEnd() {
	action = actions.skipping;

	jumpWait = true;
	jumpPause = true;
	if (pauseResolves.size > 0) {
		resolvePause();
		openInstruction?.();
		return;
	}

	jumpWait = true;
	resolveAllWaits();
}

export function back() {
	if (currentStep <= 1 && !limit) return;
	action = actions.back;
	targetStep = limit ? maxStep : currentStep - 1;
	limit = false;
	limitHitCallback?.(false);
	jumpWait = true;
	jumpPause = true;
	reset();
}

export function reset() {
	limit = false;
	limitHitCallback?.(false);
	currentStep = 0;
	killAllWaits();
	killPause();
	jumpWait = true;
	closeInstruction?.();
	if (!(action === actions.back)) {
		targetStep = -1;
		jumpWait = false;
		jumpPause = false;
	}

	resetCall();
}

export function swapAlgorithm() {
	limit = false;
	limitHitCallback?.(false);
	currentStep = 0;
	killAllWaits();
	killPause();
	jumpWait = false;
	jumpPause = false;
	targetStep = -1;
	action = actions.none;
	closeInstruction?.();
}

/** @type {Array<(reason?: any) => void>} */
let pauseResolves = [];
/** @type {Array<(reason?: any) => void>} */
let pauseRejects = [];

/** @type {Array<{id:number, value: (reason?: any) => void}>} */
let waitRejects = [];
/** @type {Array<{id:number, value: (reason?: any) => void}>} */
let waitResolves = [];

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
function setUpPromise(ms) {
	return new Promise((resolve, reject) => {
		const index = waitCount;
		waitRejects.push({ id: waitCount, value: reject });
		waitResolves.push({ id: waitCount, value: resolve });
		waitCount++;
		setTimeout(() => {
			return resolve(index);
		}, ms);
	});
}

/**
 * @param {number} ms
 */
export async function wait(ms) {
	if (jumpWait) return;
	const id = await setUpPromise(ms);
	const index = waitRejects.findIndex((x) => x.id == id);
	waitRejects.splice(index, 1);
	waitResolves.splice(index, 1);
}

export function pause() {
	if (jumpPause) return;

	return new Promise((resolve, reject) => {
		/** @type {number} */
		pauseResolves.push(resolve);
		pauseRejects.push(reject);
		pauseCount++;
	});
}

export function resolvePause() {
	for (let i = 0; i < pauseResolves.length; i++) {
		pauseResolves[i]();
	}
	clearPauses();
}

export function killPause() {
	for (let i = 0; i < pauseRejects.length; i++) {
		pauseRejects[i]();
	}
	clearPauses();
}

function clearPauses() {
	pauseResolves.splice(0, pauseResolves.length);
	pauseRejects.splice(0, pauseRejects.length);
}

export function killAllWaits() {
	for (let i2 = 0; i2 < waitRejects.length; i2++) {
		waitRejects[i2].value();
	}
	clearWaits();
}

export function resolveAllWaits() {
	for (let i = 0; i < waitResolves.length; i++) {
		waitResolves[i].value();
	}
	clearWaits();
}

function clearWaits() {
	waitResolves.splice(0, waitResolves.length);
	waitRejects.splice(0, waitRejects.length);
}

export let animating = false;
/** @type {() => Promise<void>} */
let closeInstruction;
/** @type {() => Promise<void>} */
let openInstruction;
/** @type {() => void}*/
let swapCallback;
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
	resetCall = _resetCall;
}

let targetStep = -1;
let stepCount = 0;
let goForward = false;
let goBack = false;
let swapping = false;
let limit = false;

export function limitHit() {
	goForward = false;
	animating = false;
	limit = true;

	targetStep = -1;
	stepCount = 0;
}

export async function addPause() {
	stepCount += 1;
	if (swapping && limit) {
		setJumpPause(false);
		setJumpWait(false);
		targetStep = -1;
		swapping = false;
		swapCallback();
	} else if (goBack && (stepCount === targetStep || limit)) {
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

	if (stepCount > 1) {
		closeInstruction?.();
		await wait(200);
	}
	if (pauseResolves.length > 0) {
		resolvePause();
		openInstruction?.();
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
	killAllWaits();
	killPause();
	setJumpWait(true);
	closeInstruction?.();
	setJumpWait(false);

	resetCall();
}

/**
 * @param {() => any} callback
 */
export function swapAlgorithm(callback) {
	if (limit) {
		callback();
		swapping = false;
		return;
	}
	swapCallback = callback;
	swapping = true;
	goForward = false;
	goBack = false;
	targetStep = -1;

	setJumpWait(true);
	setJumpPause(true);
	resolveAllWaits();
	resolvePause();

	closeInstruction?.();
}

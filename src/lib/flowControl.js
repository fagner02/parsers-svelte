/** @type {Map<string, Map<number, (reason?: any) => void>>} */
let pauseResolves = new Map();
/** @type {Map<string, Map<number, {error: Error,func:(reason?: any) => void}>>} */
let pauseRejects = new Map();
/** @type {Map<string, Map<number, (reason?: any) => void>>} */
let waitRejects = new Map();
/** @type {Map<string, Map<number, any>>} */
let waitRe = new Map();
/** @type {Map<string, Map<number, (reason?: any) => void>>} */
let waitResolves = new Map();

/**@type {Map<string, number>} */
let waitCount = new Map(); //0
/**@type {Map<string, number>} */
let pauseCount = new Map(); //0

/**@type {Map<string, boolean>} */
let jumpWait = new Map(); //false
/**@type {Map<string, boolean>} */
let jumpPause = new Map(); //false

/**
 * @param {boolean} value
 * @param {string} id
 */
export function setJumpWait(value, id) {
	jumpWait.set(id, value);
}

/**
 * @param {boolean} value
 * @param {string} id
 */
export function setJumpPause(value, id) {
	jumpPause.set(id, value);
}

/**
 * @param {string} id
 */
export function getJumpPause(id) {
	return jumpPause.get(id);
}

/**
 * @param {string} id
 */
export function getJumpWait(id) {
	return jumpWait.get(id);
}

/**
 * @param {string} id
 */
export function getAction(id) {
	return action.get(id);
}

/**
 * @param {string} id
 * @param {number} ms
 */
export async function wait(id, ms) {
	if (jumpWait.get(id)) return;
	return new Promise((resolve, reject) => {
		const index = waitCount.get(id) ?? 0;
		waitRejects.get(id)?.set(index, reject);
		waitRe.get(id)?.set(index, Error('wait rejected'));
		waitResolves.get(id)?.set(index, resolve);
		waitCount.set(id, index + 1);
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

/**
 * @param {string} id
 */
export function resolvePause(id) {
	for (let resolve of pauseResolves.get(id)?.values() ?? []) {
		resolve();
	}
	pauseResolves.get(id)?.clear();
	pauseRejects.get(id)?.clear();
	pauseCount.set(id, 0);
}
/**
 * @param {string} id
 */
export function killPause(id) {
	for (let reject of pauseRejects.get(id)?.values() ?? []) {
		reject.func(reject.error);
	}
	pauseResolves.get(id)?.clear();
	pauseRejects.get(id)?.clear();
	pauseCount.set(id, 0);
}

/**
 * @param {string} id
 */
export function resolveAllWaits(id) {
	for (let resolve of waitResolves.get(id)?.values() ?? []) {
		resolve();
	}
	waitResolves.get(id)?.clear();
	waitRejects.get(id)?.clear();
	waitCount.set(id, 0);
}
/**
 * @param {string} id
 */
export function killAllWaits(id) {
	for (let [i, reject] of waitRejects.get(id) ?? []) {
		reject(waitRe.get(id)?.get(i));
	}
	waitResolves.get(id)?.clear();
	waitRejects.get(id)?.clear();
	waitCount.set(id, 0);
}

/** @type {() => Promise<void>} */
let closeInstruction;
/** @type {() => Promise<void>} */
let openInstruction;
/** @type {Map<string, () => void>}*/
let resetCalls = new Map();

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
 * @param {() => void} resetCall
 * @param {string} id
 */
export function setResetCall(resetCall, id) {
	limit.set(id, false);
	currentStep.set(id, 0);
	jumpWait.set(id, false);
	jumpPause.set(id, false);
	maxStep.set(id, -1);

	resetCalls.set(id, resetCall);
}
export const flowActions = { none: -1, forward: 0, skipping: 1, back: 2 };
/**@type {Map<string, number>} */
let targetStep = new Map(); //-1
/**@type {Map<string, number>} */
let currentStep = new Map(); //0
/**@type {Map<string, number>} */
let maxStep = new Map(); //-1
/**@type {Map<string, number>} */
let action = new Map(); //flowActions.none
/**@type {Map<string, boolean>} */
let limit = new Map(); //false
/**@type {Map<string, (() => void)?>}*/
let limitHitCallback = new Map(); //null
/**
 * @param {string} id
 */
export function limitHit(id) {
	limit.set(id, true);
	limitHitCallback.get(id)?.();
	maxStep.set(id, currentStep.get(id) ?? 0);

	targetStep.set(id, -1);
	currentStep.set(id, 0);
}

/**
 * @param {string} id
 */
export function getLimitHit(id) {
	return limit.get(id) ?? false;
}

/**
 * @param {()=>void} callback
 * @param {string} id
 */
export function setLimitHitCallback(callback, id) {
	limitHitCallback.set(id, callback);
}

/**
 * @param {string} id
 */
export async function addPause(id) {
	return new Promise(async (resolve, reject) => {
		currentStep.set(id, (currentStep.get(id) ?? 0) + 1);
		if (action.get(id) === flowActions.skipping && limit.get(id)) {
			action.set(id, flowActions.none);
			jumpPause.set(id, false);
			jumpWait.set(id, false);
		}
		if (
			action.get(id) === flowActions.back &&
			(currentStep.get(id) === targetStep.get(id) || limit.get(id))
		) {
			action.set(id, flowActions.none);
			targetStep.set(id, -1);
			jumpPause.set(id, false);
			jumpWait.set(id, false);
		}
		if (action.get(id) === flowActions.forward) {
			action.set(id, flowActions.none);
			jumpWait.set(id, false);
		}

		if (jumpPause.get(id)) return resolve(null);

		pauseResolves.get(id)?.set(pauseCount.get(id) ?? 0, resolve);
		pauseRejects.get(id)?.set(pauseCount.get(id) ?? 0, {
			func: reject,
			error: Error('pause rejected')
		});
		pauseCount.set(id, (pauseCount.get(id) ?? 0) + 1);
	});
}

/**
 * @param {string} id
 */
export async function forward(id) {
	if (limit.get(id)) return;
	action.set(id, flowActions.forward);

	if ((currentStep.get(id) ?? 0) > 1) {
		closeInstruction?.();
		await wait(id, 200);
	}
	if ((pauseResolves.get(id)?.size ?? 0) > 0) {
		resolvePause(id);
		openInstruction?.();
		return;
	}

	jumpWait.set(id, true);
	resolveAllWaits(id);
}

/**
 * @param {string} id
 */
export async function skipToEnd(id) {
	action.set(id, flowActions.skipping);

	jumpPause.set(id, true);
	jumpWait.set(id, true);
	if ((pauseResolves.get(id)?.size ?? 0) > 0) {
		resolvePause(id);
		openInstruction?.();
		return;
	}

	jumpWait.set(id, true);
	resolveAllWaits(id);
}

/**
 * @param {string} id
 */
export function back(id) {
	if ((currentStep.get(id) ?? 0) <= 1 && !limit.get(id)) return;
	action.set(id, flowActions.back);
	let newStep = limit.get(id) ? maxStep.get(id) : (currentStep.get(id) ?? 0) - 1;
	targetStep.set(id, /**@type {number}*/ (newStep));
	limit.set(id, false);
	limitHitCallback.get(id)?.();

	jumpPause.set(id, true);
	jumpWait.set(id, true);
	reset(id);
}

/**
 * @param {string} id
 */
export function reset(id) {
	limit.set(id, false);
	limitHitCallback.get(id)?.();
	currentStep.set(id, 0);
	killAllWaits(id);
	killPause(id);
	jumpWait.set(id, true);
	closeInstruction?.();
	if (!(action.get(id) === flowActions.back)) {
		targetStep.set(id, -1);
		jumpPause.set(id, false);
		jumpWait.set(id, false);
	}

	resetCalls.get(id)?.();
}

/**
 * @param {string} id
 */
export function swapAlgorithm(id) {
	limitHitCallback.get(id)?.();
	if (!pauseResolves.has(id)) {
		waitCount.set(id, 0);
		waitRe.set(id, new Map());
		waitResolves.set(id, new Map());
		waitRejects.set(id, new Map());
		pauseCount.set(id, 0);
		pauseResolves.set(id, new Map());
		pauseRejects.set(id, new Map());
		limit.set(id, false);
		limitHitCallback.get(id)?.();
		currentStep.set(id, 0);
		maxStep.set(id, -1);
		action.set(id, flowActions.none);
		jumpWait.set(id, false);
		jumpPause.set(id, false);
	}
	console.log(pauseResolves, id);
}

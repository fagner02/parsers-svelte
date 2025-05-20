import { setInfoComponent } from './infoText';
import { appendData } from './log';

/** @type {Map<string, Map<number, (reason?: any) => void>>} */
let pauseResolves = new Map();
/** @type {Map<string, Map<number, {error: Error,func:(reason?: any) => void}>>} */
let pauseRejects = new Map();
/** @type {Map<string, Map<number, (reason?: any) => void>>} */
let waitRejects = new Map();
/** @type {Map<string, Map<number, (reason?: any) => void>>} */
let waitResolves = new Map();
/** @typedef {{setMaxStep: (v: number)=>void, setCurrentStep: (v: number)=>void}} Tab*/
/** @type {Map<string, Tab>} */
let tabs = new Map();
/**@type {string} */
let currentTab = '';

/**@type {Map<string, number>} */
let waitCount = new Map();
/**@type {Map<string, number>} */
let pauseCount = new Map();

/**@type {Map<string, boolean>} */
let jumpWait = new Map();
/**@type {Map<string, boolean>} */
let jumpPause = new Map();

/**
 * @param {string} tabId
 * @param {Tab} tab
 */
export function setTab(tabId, tab) {
	tabs.set(tabId, tab);
}

/**
 * @param {number} step
 */
export function setCurrentStep(step) {
	tabs.get(currentTab)?.setCurrentStep(step);
}
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
 * @param {number} ms
 */
export async function wait(id, ms) {
	if (jumpWait.get(id)) return;
	let er = Error('wait rejected');
	return new Promise((resolve, reject) => {
		const index = waitCount.get(id) ?? 0;
		waitRejects.get(id)?.set(index, () => reject(er));
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
		setTimeout(() => {
			return resolve(null);
		}, ms);
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
		try {
			reject(waitRejects.get(id)?.get(i));
		} catch (e) {}
	}
	waitResolves.get(id)?.clear();
	waitRejects.get(id)?.clear();
	waitCount.set(id, 0);
}

/** @type {() => Promise<void>} */
let closeInstruction;
/** @type {() => Promise<void>} */
let openInstruction;
/** @type {Map<string, (step:number) => void>}*/
let resetCalls = new Map();
/** @type {Map<string, () => void>}*/
let onInputChanged = new Map();
/** @type {Map<string, () => number>}*/
let getSteps = new Map();

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
 * @param {(step:number) => void} resetCall
 * @param {number} lastSaveIndex
 * @param {string} id
 * @param {()=> number} getStep
 */
export function setStepCall(resetCall, lastSaveIndex, id, getStep) {
	tabs.get(currentTab)?.setMaxStep(lastSaveIndex);
	jumpWait.set(id, false);
	jumpPause.set(id, false);
	maxStep.set(id, lastSaveIndex);
	getSteps.set(id, getStep);
	resetCalls.set(id, resetCall);
}

/**
 * @param {number} step
 * @param {string} id
 */
export function setMaxStep(step, id) {
	maxStep.set(id, step);
}

/**@type {Map<string, number>} */
let maxStep = new Map();

/**
 * @param {string} id
 */
export async function addPause(id) {
	return new Promise(async (resolve, reject) => {
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
 * @param {() => void} callback
 * @param {string} id
 */
export function setOnInputChanged(callback, id) {
	onInputChanged.set(id, callback);
}

/**
 * @param {string} id
 */
export function inputChanged(id) {
	killAllWaits(id);
	killPause(id);
	onInputChanged.get(id)?.();
}

/**
 * @param {string} id
 * @param {number} step
 */
export function goToStep(id, step) {
	killAllWaits(id);
	killPause(id);
	jumpPause.set(id, false);
	jumpWait.set(id, false);
	resetCalls.get(id)?.(step);
}

/**
 * @param {string} id
 */
export async function forward(id) {
	appendData(`control flow,forward`);
	if (maxStep.get(id) === getSteps.get(id)?.()) return;

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
	appendData(`control flow,skip to end`);

	killAllWaits(id);
	killPause(id);
	jumpPause.set(id, false);
	jumpWait.set(id, false);
	resetCalls.get(id)?.(maxStep.get(id) ?? 0);
}

/**
 * @param {string} id
 */
export function back(id) {
	appendData(`control flow,back`);
	if ((getSteps.get(id)?.() ?? 0) <= 0) return;
	killAllWaits(id);
	killPause(id);
	jumpPause.set(id, false);
	jumpWait.set(id, false);
	resetCalls.get(id)?.((getSteps.get(id)?.() ?? 1) - 1);
}

/**
 * @param {string} id
 */
export function reset(id) {
	appendData(`control flow,reset`);

	killAllWaits(id);
	killPause(id);
	closeInstruction?.();
	jumpPause.set(id, false);
	jumpWait.set(id, false);
	resetCalls.get(id)?.(0);
}

/**
 * @param {string} id
 * @param {ConstructorOfATypedSvelteComponent} infoComp
 * @param {string} tabId
 */
export function swapAlgorithm(id, infoComp, tabId) {
	const tab = tabs.get(tabId);
	currentTab = tabId;
	if (tab) {
		tab.setMaxStep(maxStep.get(id) ?? 0);
	}
	setInfoComponent(infoComp);
	if (!pauseResolves.has(id)) {
		waitCount.set(id, 0);
		waitResolves.set(id, new Map());
		waitRejects.set(id, new Map());
		pauseCount.set(id, 0);
		pauseResolves.set(id, new Map());
		pauseRejects.set(id, new Map());
		maxStep.set(id, -1);
		jumpWait.set(id, false);
		jumpPause.set(id, false);
	}
}

export function clearControlFlow() {
	for (let id of resetCalls.keys()) {
		killAllWaits(id);
		killPause(id);
	}
	waitCount.clear();
	waitResolves.clear();
	waitRejects.clear();
	pauseCount.clear();
	pauseResolves.clear();
	pauseRejects.clear();
	maxStep.clear();
	jumpWait.clear();
	jumpPause.clear();
}

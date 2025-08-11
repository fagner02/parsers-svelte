import { setInfoComponent } from './infoText';
import { appendData } from './log';

/**
 * @typedef {{
 * setMaxStep: (v: number)=>void,
 * setCurrentStep: (v: number)=>void
 * setIsPlaying: Function
 * }} Tab
 */
/**
 * @typedef {{
 * pauseResolves: Map<number, (reason?: any) => void>,
 * pauseRejects: Map<number, {error: Error,func:(reason?: any) => void}>,
 * waitRejects: Map<number, (reason?: any) => void>,
 * waitResolves: Map<number, (reason?: any) => void>
 * pauseCount: number,
 * waitCount: number,
 * jumpWait: boolean,
 * jumpPause: boolean,
 * resetCall?: Function,
 * onInputChanged?: Function,
 * getStep?: Function,
 * maxStep: number
 * }} Algo
 * */

/** @type {Map<string, Tab>} */
let tabs = new Map();
/** @type {Map<string, Algo>} */
let algos = new Map();
/**@type {string} */
let currentTab = '';

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
	const tab = algos.get(id);
	if (tab) tab.jumpWait = value;
}

/**
 * @param {boolean} value
 * @param {string} id
 */
export function setJumpPause(value, id) {
	const tab = algos.get(id);
	if (tab) tab.jumpPause = value;
}

/**
 * @param {string} id
 */
export function getJumpPause(id) {
	return algos.get(id)?.jumpPause;
}

/**
 * @param {string} id
 */
export function getJumpWait(id) {
	return algos.get(id)?.jumpWait;
}

/**
 * @param {string} id
 * @param {number} ms
 */
export async function wait(id, ms) {
	const algo = algos.get(id);
	if (!algo || algo.jumpWait) return;
	let er = Error('wait rejected');
	return new Promise((resolve, reject) => {
		const index = algo.waitCount ?? 0;
		algo.waitRejects?.set(index, () => reject(er));
		algo.waitResolves?.set(index, resolve);
		algo.waitCount = index + 1;
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
	const algo = algos.get(id);
	if (!algo) return;
	for (let resolve of algo.pauseResolves?.values() ?? []) {
		resolve();
	}
	algo.pauseResolves?.clear();
	algo.pauseRejects?.clear();
	algo.pauseCount = 0;
}
/**
 * @param {string} id
 */
export function killPause(id) {
	const algo = algos.get(id);
	if (!algo) return;
	for (let reject of algo.pauseRejects?.values() ?? []) {
		reject.func(reject.error);
	}
	algo.pauseResolves?.clear();
	algo.pauseRejects?.clear();
	algo.pauseCount = 0;
}

/**
 * @param {string} id
 */
export function resolveAllWaits(id) {
	const algo = algos.get(id);
	if (!algo) return;
	for (let resolve of algo.waitResolves?.values() ?? []) {
		resolve();
	}
	algo.waitResolves?.clear();
	algo.waitRejects?.clear();
	algo.waitCount = 0;
}
/**
 * @param {string} id
 */
export function killAllWaits(id) {
	const algo = algos.get(id);
	if (!algo) return;
	for (let [i, reject] of algo.waitRejects ?? []) {
		try {
			reject(algo.waitRejects?.get(i));
		} catch (e) {}
	}
	algo.waitResolves?.clear();
	algo.waitRejects?.clear();
	algo.waitCount = 0;
}

/** @type {() => Promise<void>} */
let closeInstruction;
/** @type {() => Promise<void>} */
let openInstruction;
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
	const algo = algos.get(id);
	const tab = tabs.get(currentTab);
	if (!tab) return;
	if (!algo) return;
	tab.setMaxStep(lastSaveIndex);
	algo.jumpWait = false;
	algo.jumpPause = false;
	algo.maxStep = lastSaveIndex;
	algo.getStep = getStep;
	algo.resetCall = resetCall;
}

/**
 * @param {number} step
 * @param {string} id
 */
export function setMaxStep(step, id) {
	const algo = algos.get(id);
	if (!algo) return;

	tabs.get(currentTab)?.setMaxStep(step);
	setCurrentStep(algo.getStep?.() ?? 0);
	algo.maxStep = step;
}

/**
 * @param {string} tabId
 */
export function setCurrentTab(tabId) {
	currentTab = tabId;
}

/**
 * @param {string} id
 */
export async function addPause(id) {
	const tab = tabs.get(currentTab);
	const algo = algos.get(id);
	if (!algo) return;
	tab?.setIsPlaying(false);
	algo.jumpWait = false;
	return new Promise(async (resolve, reject) => {
		if (algo.jumpPause) return resolve(null);

		algo.pauseResolves?.set(algo.pauseCount ?? 0, resolve);
		algo.pauseRejects?.set(algo.pauseCount ?? 0, {
			func: reject,
			error: Error('pause rejected')
		});
		algo.pauseCount = (algo.pauseCount ?? 0) + 1;
	});
}

/**
 * @param {() => void} callback
 * @param {string} id
 */
export function setOnInputChanged(callback, id) {
	const algo = algos.get(id);
	if (!algo) return;

	algo.onInputChanged = callback;
}

/**
 * @param {string} id
 */
export function inputChanged(id) {
	const algo = algos.get(id);
	if (!algo) return;

	killAllWaits(id);
	killPause(id);
	algo.onInputChanged?.();
}

/**
 * @param {string} id
 * @param {number} step
 */
export function goToStep(id, step) {
	const algo = algos.get(id);
	if (!algo) return;

	killAllWaits(id);
	killPause(id);
	algo.jumpPause = false;
	algo.jumpWait = false;
	algo.resetCall?.(step);
}

/**
 * @param {string} id
 */
export async function forward(id) {
	const algo = algos.get(id);
	if (!algo) return;

	tabs.get(currentTab)?.setIsPlaying(true);
	appendData(`control flow,forward`);
	if (algo.maxStep === algo.getStep?.()) return;

	if ((algo.pauseResolves?.size ?? 0) > 0) {
		resolvePause(id);
		openInstruction?.();
		return;
	}

	algo.jumpWait = true;
	resolveAllWaits(id);
}

/**
 * @param {string} id
 */
export async function skipToEnd(id) {
	const algo = algos.get(id);
	if (!algo) return;

	appendData(`control flow,skip to end`);

	killAllWaits(id);
	killPause(id);
	algo.jumpPause = false;
	algo.jumpWait = false;
	algo.resetCall?.(algo.maxStep ?? 0);
}

/**
 * @param {string} id
 */
export function back(id) {
	const algo = algos.get(id);
	if (!algo) return;

	appendData(`control flow,back`);
	if ((algo.getStep?.() ?? 0) <= 0) return;
	killAllWaits(id);
	killPause(id);
	algo.jumpPause = false;
	algo.jumpWait = false;
	algo.resetCall?.((algo.getStep?.() ?? 1) - 1);
}

/**
 * @param {string} id
 */
export function reset(id) {
	const algo = algos.get(id);
	if (!algo) return;

	appendData(`control flow,reset`);

	killAllWaits(id);
	killPause(id);
	closeInstruction?.();
	algo.jumpPause = false;
	algo.jumpWait = false;
	algo.resetCall?.(0);
}

/**
 * @param {string} id
 * @param {ConstructorOfATypedSvelteComponent} infoComp
 * @param {string} tabId
 */
export function swapAlgorithm(id, infoComp, tabId) {
	currentTab = tabId;
	const algo = algos.get(id);
	const tab = tabs.get(tabId);
	if (!tab) return;

	tab.setMaxStep(algo?.maxStep ?? 0);
	setCurrentStep(algo?.getStep?.() ?? 0);

	setInfoComponent(infoComp);
	if (!algo) {
		algos.set(id, {
			waitCount: 0,
			waitResolves: new Map(),
			waitRejects: new Map(),
			pauseCount: 0,
			pauseResolves: new Map(),
			pauseRejects: new Map(),
			maxStep: -1,
			jumpWait: false,
			jumpPause: false
		});
	}
}

export function clearControlFlow() {
	for (let id of algos.keys()) {
		killAllWaits(id);
		killPause(id);
	}
	//algos.clear();
}

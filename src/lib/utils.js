/**
 *
 * @param {string} text
 * @param {number} fontSize
 */
export function getTextWidth(text, fontSize) {
	const canvas = document.createElement('canvas');
	const context = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
	context.font = `${fontSize}px spacemono`;
	const metrics = context.measureText(text);
	canvas.remove();
	return metrics.width;
}

/** @type {Array<(reason?: any) => void>} */
let pauseResolves = [];
/** @type {Array<(reason?: any) => void>} */
let pauseRejects = [];

export let getPauseResolvesLength = () => pauseResolves.length;
/** @type {Array<{id:number, value: (reason?: any) => void}>} */
let waitRejects = [];
export let getWaitRejectsLength = () => waitRejects.length;
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
	try {
		return new Promise((resolve, reject) => {
			/** @type {number} */
			pauseResolves.push(resolve);
			pauseRejects.push(reject);
			pauseCount++;
		});
	} catch (e) {
		return;
	}
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
import { Capacitor } from '@capacitor/core';
export const platforms = {
	web: 0,
	mobile: 1,
	desktop: 2
};
export function getPlatform() {
	if (!window) return;

	if (/**@type {any}*/ (window)?.__TAURI__ !== undefined) return platforms.web;

	if (Capacitor.getPlatform() === 'web') return platforms.web;

	return platforms.mobile;
}

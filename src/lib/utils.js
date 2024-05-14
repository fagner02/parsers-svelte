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
let rejects = [];
let jumpWait = false;
let jumpPause = false;
export function jumpWaitTrue() {
	jumpWait = true;
}
export function jumpWaitFalse() {
	jumpWait = false;
}
export function jumpPauseTrue() {
	jumpPause = true;
}
export function jumpPauseFalse() {
	jumpPause = false;
}
/**
 * @param {number} ms
 */
export function wait(ms) {
	if (jumpWait) return;
	return new Promise((resolve, reject) => {
		/** @type {number} */
		setTimeout(() => {
			return resolve(null);
		}, ms);
	});
}

export function pause() {
	if (jumpPause) return;
	try {
		return new Promise((resolve, reject) => {
			/** @type {number} */
			rejects.push(reject);
		});
	} catch (e) {
		return;
	}
}

export function killPause() {
	if (rejects.length > 0) rejects[rejects.length - 1]();
}

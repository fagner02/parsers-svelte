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
/** @type {Array<(reason?: any) => void>} */
let waitRejects = [];

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
function setUpPromise(ms) {
	return new Promise((resolve, reject) => {
		const index = waitRejects.length;
		waitRejects.push(reject);
		/** @type {number} */
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
	const index = await setUpPromise(ms);
	waitRejects.splice(index, 1);
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
	if (rejects.length > 0) {
		rejects[rejects.length - 1]();
		rejects.pop();
	}
}

export function killAllWaits() {
	try {
		for (let i = 0; i < waitRejects.length; i++) {
			try {
				waitRejects[i]('hgj');
			} catch (e) {}
			console.log('killing', waitRejects);
		}
	} catch (e) {}
	waitRejects.splice(0, waitRejects.length);
	console.log('killed', waitRejects);
}

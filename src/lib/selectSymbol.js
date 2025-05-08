import { getJumpPause, wait } from './flowControl';
export const colors = {
	blue: 200,
	green: 110,
	orange: 30,
	pink: 300
};
/**
 * @param {string} card
 * @param {number} index1
 * @param {number} hue
 * @param {boolean} padded
 */
export async function selectLSymbol(card, index1, hue, padded = true) {
	return new Promise(async (resolve, reject) => {
		try {
			let symbol = /** @type {HTMLElement} */ (document.querySelector(`#${card}l${index1}`));
			if (symbol === null) return resolve(null);
			symbol.classList.add(padded ? 'block' : 'empty');
			symbol.style.setProperty('--block-hue', hue.toString());
			await wait(500);
			resolve(null);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * @param {string} setCardId
 * @param {number} index1
 * @param {number} index2
 * @param {number} hue
 * @param {boolean} padded
 */
export async function selectRSymbol(setCardId, index1, index2, hue, padded = true) {
	return new Promise(async (resolve, reject) => {
		try {
			let symbol = /** @type {HTMLElement} */ (
				document.querySelector(`#${setCardId}r${index1}-${index2}`)
			);
			if (symbol === null) return resolve(null);
			symbol.classList.add(padded ? 'block' : 'empty');
			symbol.style.setProperty('--block-hue', hue.toString());
			await wait(500);
			resolve(null);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * @param {string} id
 * @param {boolean} padded
 * @param {number} hue
 */
export async function selectSymbol(id, hue, padded = true) {
	if (getJumpPause()) return;
	return new Promise(async (resolve, reject) => {
		try {
			if (!id.startsWith('#')) id = '#' + id;
			let symbol = /** @type {HTMLElement} */ (document.querySelector(id));
			if (symbol === null) return resolve(null);
			symbol.classList.add(padded ? 'block' : 'empty');
			symbol.style.setProperty('--block-hue', hue.toString());
			await wait(500);
			resolve(null);
		} catch (e) {
			reject(e);
		}
	});
}
/**
 * @param {string} id
 */
export function deselectSymbol(id) {
	return new Promise(async (resolve, reject) => {
		try {
			if (!id.startsWith('#')) id = '#' + id;
			let symbol = /** @type {HTMLElement} */ (document.querySelector(id));
			if (symbol === null) return resolve(null);
			symbol.classList.add('block-deselect');
			await wait(500);
			symbol.classList.remove('empty', 'block', 'block-deselect');
			symbol.style.setProperty('--block-hue', '0');

			resolve(null);
		} catch (e) {
			reject(e);
		}
	});
}

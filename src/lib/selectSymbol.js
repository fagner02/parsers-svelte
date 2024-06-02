import { wait } from './flowControl';

/**
 * @param {string} card
 * @param {number} index1
 * @param {string} color
 * @param {boolean} empty
 */
export async function selectLSymbol(card, index1, color, empty) {
	let symbol = /** @type {HTMLElement} */ (document.querySelector(`#${card}l${index1}`));
	symbol.classList.add(empty ? 'empty' : 'block');
	symbol.classList.add(`${color}-after`);
	await wait(500);
}

/**
 * @param {string} card
 * @param {number} index1
 * @param {number} index2
 * @param {string} color
 * @param {boolean} empty
 */
export async function selectRSymbol(card, index1, index2, color, empty) {
	let symbol = /** @type {HTMLElement} */ (document.querySelector(`#${card}r${index1}-${index2}`));
	symbol.classList.add(empty ? 'empty' : 'block');
	symbol.classList.add(`${color}-after`);
	await wait(500);
}

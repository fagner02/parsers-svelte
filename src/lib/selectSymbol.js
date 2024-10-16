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
 * @param {string} setCardId
 * @param {number} index1
 * @param {number} index2
 * @param {string} color
 * @param {boolean} empty
 */
export async function selectRSymbol(setCardId, index1, index2, color, empty = false) {
	let symbol = /** @type {HTMLElement} */ (
		document.querySelector(`#${setCardId}r${index1}-${index2}`)
	);
	let oldColor = symbol.classList.values().find((x) => x.includes('-after'));
	if (oldColor) symbol.classList.remove(oldColor);
	symbol.classList.add(empty ? 'empty' : 'block');
	symbol.classList.add(`${color}-after`);
	await wait(500);
}

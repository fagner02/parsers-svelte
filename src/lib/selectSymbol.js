import { wait } from './flowControl';
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
 * @param {boolean} empty
 */
export async function selectLSymbol(card, index1, hue, empty = false) {
	let symbol = /** @type {HTMLElement} */ (document.querySelector(`#${card}l${index1}`));
	if (symbol === null) return;
	symbol.classList.add(empty ? 'empty' : 'block');
	symbol.style.setProperty('--block-hue', hue.toString());
	await wait(500);
}

/**
 * @param {string} setCardId
 * @param {number} index1
 * @param {number} index2
 * @param {number} hue
 * @param {boolean} empty
 */
export async function selectRSymbol(setCardId, index1, index2, hue, empty = false) {
	let symbol = /** @type {HTMLElement} */ (
		document.querySelector(`#${setCardId}r${index1}-${index2}`)
	);
	if (symbol === null) return;
	symbol.classList.add(empty ? 'empty' : 'block');
	symbol.style.setProperty('--block-hue', hue.toString());
	await wait(500);
}
/**
 * @param {string} setCardId
 * @param {number} index1
 * @param {number} index2
 */
export function deselect(setCardId, index1, index2) {
	let symbol = /** @type {HTMLElement} */ (
		document.querySelector(`#${setCardId}r${index1}-${index2}`)
	);
	if (symbol === null) return;
	symbol.classList.remove('empty', 'block');
	symbol.style.setProperty('--block-hue', '0');
}

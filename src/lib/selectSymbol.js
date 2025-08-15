import { getJumpPause, wait } from './flowControl';
export const colors = {
	blue: 200,
	green: 110,
	orange: 30,
	pink: 300,
	cyan: 150,
	red: 350
};
/**@type {Map<string, Set<string>>} */
let selectedSymbolsMap = new Map();

/**
 * @param {string} id
 * @param {Parameters<selectSymbol>[]} symbolIds
 */
export function resetAllSymbols(id, symbolIds) {
	for (const symbolId of selectedSymbolsMap.get(id) ?? []) {
		let symbol = document.querySelector(symbolId);
		symbol?.classList.remove('empty', 'block', 'block-deselect');
	}
	let selectedSymbols = new Set();

	for (const symbolId of symbolIds) {
		if (!symbolId[0].startsWith('#')) symbolId[0] = '#' + symbolId[0];
		let symbol = /** @type {HTMLElement} */ (document.querySelector(symbolId[0]));
		if (!symbol) {
			console.error(symbolId[0], symbol);
			continue;
		}
		selectedSymbols.add(symbolId[0]);
		symbol.classList.add(symbolId[3] ? 'block' : 'empty');
		symbol.style.setProperty('--block-hue', symbolId[1].toString());
	}
	selectedSymbolsMap.set(id, selectedSymbols);
}
/**
 * @param {string} card
 * @param {number} index1
 * @param {number} hue
 * @param {string} id
 * @param {boolean} padded
 */
export async function selectLSymbol(card, index1, hue, id, padded = true) {
	return new Promise(async (resolve, reject) => {
		try {
			let symbol = /** @type {HTMLElement} */ (document.querySelector(`#${card}l${index1}`));
			if (symbol === null) return resolve(null);
			symbol.classList.add(padded ? 'block' : 'empty');
			symbol.style.setProperty('--block-hue', hue.toString());
			await wait(id, 500);
			// addSymbolId(id, );
			resolve(null);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * @param {string} id
 * @param {string} symbolId
 */
function addSymbolId(id, symbolId) {
	let selectedSymbols = selectedSymbolsMap.get(id);
	if (!selectedSymbols) {
		selectedSymbols = new Set();
		selectedSymbolsMap.set(id, selectedSymbols);
	}
	selectedSymbols.add(symbolId);
}

/**
 * @param {string} setCardId
 * @param {number} index1
 * @param {number} index2
 * @param {number} hue
 * @param {boolean} padded
 * @param {string} id
 */
export async function selectRSymbol(setCardId, index1, index2, hue, id, padded = true) {
	return new Promise(async (resolve, reject) => {
		try {
			let symbol = /** @type {HTMLElement} */ (
				document.querySelector(`#${setCardId}r${index1}-${index2}`)
			);
			if (symbol === null) return resolve(null);
			symbol.classList.add(padded ? 'block' : 'empty');
			symbol.style.setProperty('--block-hue', hue.toString());
			await wait(id, 500);
			// addSymbolId(id);
			resolve(null);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * @param {string} symbolId
 * @param {number} hue
 * @param {string} id
 * @param {boolean} padded
 */
export async function selectSymbol(symbolId, hue, id, padded = true) {
	if (getJumpPause(id)) return;
	return new Promise(async (resolve, reject) => {
		try {
			symbolId = '#' + symbolId;
			let symbol = /** @type {HTMLElement} */ (document.querySelector(symbolId));
			if (symbol === null) {
				console.error('Symbol not found', symbolId);
				return resolve(null);
			}
			symbol.classList.add(padded ? 'block' : 'empty');
			symbol.style.setProperty('--block-hue', hue.toString());
			await wait(id, 500);
			addSymbolId(id, symbolId);
			resolve(null);
		} catch (e) {
			reject(e);
		}
	});
}
/**
 * @param {string} symbolId
 * @param {string} id
 */
export function deselectSymbol(symbolId, id) {
	return new Promise(async (resolve, reject) => {
		try {
			symbolId = '#' + symbolId;
			let symbol = /** @type {HTMLElement} */ (document.querySelector(symbolId));
			if (symbol === null) {
				console.error('Symbol not found', symbolId);
				resolve(null);
			}
			symbol.classList.add('block-deselect');
			await wait(id, 500);
			symbol.classList.remove('empty', 'block', 'block-deselect');
			symbol.style.setProperty('--block-hue', '0');
			selectedSymbolsMap.get(id)?.delete(id);
			resolve(null);
		} catch (e) {
			reject(e);
		}
	});
}

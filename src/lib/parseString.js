/**@type {string[]}*/
export let inputString = [];

/**
 * @param {string} value
 */
export function setInputString(value) {
	inputString = value.split(' ').filter((x) => x !== '');
}

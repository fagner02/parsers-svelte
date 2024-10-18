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

/** @type {Array<import('@/types').GrammarItem>} */
let rules = [];
/** @type {Array<string>}*/
let nt = [];
/** @type {Array<string>}*/
let t = [];

/**
 * @param {string} grammar
 */
export function loadGrammar(grammar) {
	let ntSet = new Set();
	let tSet = new Set();
	let alphSet = new Set();
	rules = [];

	grammar.split('\n').forEach((r) => {
		let s = r.split('->');

		if (s.length > 1) {
			rules.push({
				left: s[0].replaceAll(' ', ''),
				right: s[1].trim().split(' '),
				index: rules.length
			});
			alphSet = alphSet.union(new Set(s[1].trim().split(' ')));
			ntSet.add(s[0].replaceAll(' ', ''));
		}
	});

	alphSet.delete('');
	for (let v of alphSet) {
		if (!ntSet.has(v)) tSet.add(v);
	}

	t = ['$'].concat(Array.from(tSet));
	nt = Array.from(ntSet);
	return { t, nt, rules };
}

export function getGrammar() {
	return { t, nt, rules };
}

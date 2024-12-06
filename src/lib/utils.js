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
export let grammar = `S -> A A
A -> a A
A -> b`;

/**
 * @param {string} text
 */
export function setGrammarText(text) {
	grammar = text;
}

export function loadGrammar() {
	let ntSet = new Set();
	let tSet = new Set();
	let alphSet = new Set();
	rules = [];

	grammar.split('\n').forEach((r) => {
		let s = r.split('->');

		if (s.length > 1) {
			rules.push({
				left: s[0].trim(),
				right: s[1].trim().split(' '),
				index: rules.length
			});
			for (let item of new Set(s[1].trim().split(' '))) {
				alphSet.add(item);
			}
			ntSet.add(s[0].trim());
		}
	});

	alphSet.delete('');
	for (let v of alphSet) {
		if (!ntSet.has(v)) tSet.add(v);
	}

	t = Array.from(tSet).concat(['$']);
	nt = Array.from(ntSet);
	console.log(t);
	console.log(nt);
	console.log(rules);
	return { t, nt, rules };
}

export function getAugGrammar() {
	let augRules = [{ index: 0, left: `${rules[0]?.left}'`, right: [`${rules[0]?.left}`] }].concat(
		rules.map((x) => {
			return {
				index: x.index + 1,
				left: x.left,
				right: x.right
			};
		})
	);
	return {
		t,
		nt,
		augRules,
		alphabet: [...t, ...nt],
		startingSymbol: augRules[0].left
	};
}

export function getGrammar() {
	return {
		t,
		nt,
		rules,
		alphabet: [...t, ...nt],
		startingSymbol: rules.length === 0 ? '' : rules[0].left
	};
}

export function isGrammarLoaded() {
	return rules.length > 0;
}

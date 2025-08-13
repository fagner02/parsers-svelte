import { browser } from '$app/environment';
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

export function getDeviceType() {
	const ua = navigator.userAgent;
	const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
	const isTablet =
		/(iPad|Android(?!.*Mobile))/i.test(ua) ||
		(screen.width <= 1024 && screen.height <= 768 && 'ontouchstart' in window);

	if (isTablet) return 'tablet';
	if (isMobile) return 'mobile';
	return 'desktop';
}

/** @type {Array<import('@/types').GrammarItem>} */
let rules = [];
/** @type {Array<string>}*/
let nt = [];
/** @type {Array<string>}*/
let t = [];
/**@type {(()=>void)?} */
let grammarChangeCallback = null;
/**
 * @param {()=>void} value
 */
export function setGrammarChangeCallback(value) {
	grammarChangeCallback = value;
}
export let grammar = `E -> E + T
E -> T
T -> T * F
T -> F
F -> id`;

/**
 * @param {string} text
 */
export function setGrammarText(text) {
	grammar = text;
	grammarChangeCallback?.();
}

export function loadGrammar() {
	console.log('Loading grammar', grammar);
	let ntSet = new Set();
	let tSet = new Set();
	let alphSet = new Set();
	rules = [];

	grammar.split('\n').forEach((r) => {
		let s = r.split('->');

		if (s.length > 1) {
			let right = s[1].split('|');
			for (let i = 0; i < right.length; i++) {
				rules.push({
					left: s[0].trim(),
					right: right[i].trim().split(' '),
					index: rules.length
				});
				for (let item of new Set(right[i].trim().split(' '))) {
					alphSet.add(item);
				}
				ntSet.add(s[0].trim());
			}
		}
	});

	alphSet.delete('');
	for (let v of alphSet) {
		if (!ntSet.has(v)) tSet.add(v);
	}

	t = Array.from(tSet).concat(['$']);
	nt = Array.from(ntSet);
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

import { browser } from '$app/environment';

/**
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

export const fontSize = 13;
export const subFontSize = 9;
export let subCharWidth = getTextWidth('P', subFontSize);
export let charWidth = getTextWidth('P', fontSize);

const style = /**@type {HTMLElement}*/ (document.querySelector(':root'));
style.style.setProperty('--height', `${1.5 * fontSize}px`);

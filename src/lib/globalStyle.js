/**
 * @param {string} text
 * @param {number} fontSize
 */
export function getTextWidth(text, fontSize) {
	const canvas = document.createElement('canvas');
	const context = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
	context.font = `${fontSize}rem spacemono`;
	const metrics = context.measureText(text);
	canvas.remove();
	return metrics.width * 0.0625;
}

export const fontSize = 0.8;
export const subFontSize = 0.55;
export const lineHeight = 1.7 * fontSize;
export let subCharWidth = getTextWidth('P', subFontSize);
export let charWidth = getTextWidth('P', fontSize);
const style = /**@type {HTMLElement}*/ (document.querySelector(':root'));
style.style.setProperty('--height', `${1.5 * fontSize}rem`);

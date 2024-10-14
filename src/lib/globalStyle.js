/**
 * @param {string} text
 * @param {number} fontSize
 * @param {string} unit
 */
export function getTextWidth(text, fontSize, unit) {
	const canvas = document.createElement('canvas');
	const context = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
	context.font = `${fontSize}${unit} spacemono`;
	const metrics = context.measureText(text);
	canvas.remove();
	return metrics.width;
}

export const fontSize = getTextWidth('a', 1.55, 'rem');
export const subFontSize = getTextWidth('a', 1.25, 'rem');
export const lineHeight = 1.7 * fontSize;
export let subCharWidth = getTextWidth('P', subFontSize, 'px');
export let charWidth = getTextWidth('P', fontSize, 'px');
const style = /**@type {HTMLElement}*/ (document.querySelector(':root'));
style.style.setProperty('--height', `${1.5 * fontSize}px`);

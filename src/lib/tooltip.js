import { noJumpWait } from './flowControl';

let activeTooltip = null;

/**
 * @param {MouseEvent} e
 * @param {string} text
 * @param {number} hue
 */
export async function showTooltip(e, text, hue) {
	let tooltip = /**@type {HTMLElement}*/ (document.querySelector('.tooltip'));
	let tooltipText = /**@type {HTMLElement}*/ (tooltip.querySelector('#tooltip'));
	let arrow = /**@type {HTMLElement}*/ (tooltip.querySelector('.arrow'));
	tooltip.style.setProperty('--hue', `${hue}`);
	if (!arrow || !tooltipText || !tooltip) return;
	let id = crypto.randomUUID();
	activeTooltip = id;
	await noJumpWait(0);
	if (activeTooltip !== id) return;

	tooltip.style.opacity = '1';
	tooltipText.innerText = text;

	if (!e.target) return;

	let rect = /**@type {HTMLElement}*/ (e.target).getBoundingClientRect();
	let tooltipRect = tooltip.getBoundingClientRect();
	let arrowRect = arrow.getBoundingClientRect();

	let x = rect.x + rect.width / 2 - tooltipRect.width / 2;
	let y = rect.y + rect.height + 10;
	if (x < 0) x = 0;
	if (y < 0) y = 0;
	if (x + tooltipRect.width > window.innerWidth) {
		x = window.innerWidth - tooltipRect.width;
	}
	if (y + tooltipRect.height > window.innerHeight) {
		y = window.innerHeight - tooltipRect.height;
	}
	tooltip.style.left = `${x}px`;
	tooltip.style.top = `${y}px`;
	let left = tooltipRect.width / 2 - arrowRect.width / 2;
	arrow.style.left = `${left}px`;
	arrow.style.top = `${0.1 + (tooltipRect.height / 2 - arrowRect.height / 2)}px`;
	arrow.style.transform = `translate(${rect.left - x - left + rect.width / 2 - arrowRect.width / 2}px, ${-tooltipRect.height / 2}px) rotate(0deg)`;
}

/**@param {HTMLElement} elem */
export async function removeTooltip(elem) {
	let id = elem.getAttribute('tooltip-id');
	if (id) {
		map.get(id)?.();
	}
}
export async function hideTooltip() {
	activeTooltip = null;
	let tooltip = /**@type {HTMLElement}*/ (document.querySelector('.tooltip'));
	if (!tooltip) return;
	tooltip.style.opacity = '0';
}

let map = new Map();

/**
 * @param {HTMLElement} elem
 * @param {{text: string, willRemove?: boolean, hue?: number}} data
 */
export function setUpTooltip(elem, { text, willRemove = false, hue = 200 }) {
	if (!elem) return;
	let show = (/**@type {MouseEvent}*/ e) => {
		showTooltip(e, text, hue);
	};
	let hide = () => {
		hideTooltip();
	};

	elem.addEventListener('mouseenter', show);
	elem.addEventListener('mouseleave', hide);
	elem.addEventListener('click', hide);
	if (willRemove) {
		let id = elem.getAttribute('tooltip-id');
		if (id) {
			map.get(id)?.();
		} else {
			id = crypto.randomUUID();
			elem.setAttribute('tooltip-id', id);
		}
		map.set(id, () => {
			elem.removeEventListener('mouseenter', show);
			elem.removeEventListener('mouseleave', hide);
			elem.removeEventListener('click', hide);
		});
	}
}

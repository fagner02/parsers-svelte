import { noJumpWait } from '$lib/flowControl';

export class Tooltip {
	/**@type {string?} */
	activeTooltip = null;

	removeCalls = new Map();
}

/**@type {Map<number, Tooltip>} */
let tooltipsGroups = new Map();

/**
 * @param {number} groupId
 */
export function getTooltipGroups(groupId) {
	return tooltipsGroups.get(groupId);
}
/**
 * @param {number} step
 * @param {string | any[]} functionCalls
 */
export function resetTooltips(step, functionCalls) {
	for (let i = step; i < functionCalls.length; i++) {
		const item = functionCalls[i];
		if (item.name === 'setUpTooltip') {
			removeTooltip(item.args[0], 2);
		}
	}
	for (let i = 0; i < step; i++) {
		const item = functionCalls[i];
		if (item.name === 'setUpTooltip') {
			setUpTooltip(item.args[0], item.args[1]);
		}
	}
	hideTooltip(1);
}

/**
 * @param {number} groupId
 */
export function registerTooltipGroup(groupId) {
	tooltipsGroups.set(groupId, new Tooltip());
}
/**@param {number} groupId */
export async function hideTooltip(groupId) {
	const group = tooltipsGroups.get(groupId);
	if (!group) return;
	group.activeTooltip = null;
	let tooltip = /**@type {HTMLElement}*/ (document.querySelector(`#tooltip-${groupId}`));
	if (!tooltip) return;
	tooltip.style.opacity = '0';
}

/**
 * @param {EventTarget|null|string} e
 * @param {string} text
 * @param {number} hue
 * @param {number} groupId
 */
export async function showTooltip(e, text, hue, groupId) {
	const tooltip = tooltipsGroups.get(groupId);
	let tooltipElem = /**@type {HTMLElement}*/ (document.querySelector(`#tooltip-${groupId}`));
	let tooltipText = /**@type {HTMLElement}*/ (tooltipElem.querySelector('#tooltip'));
	let arrow = /**@type {HTMLElement}*/ (tooltipElem.querySelector('.arrow'));
	tooltipElem.style.setProperty('--hue', `${hue}`);
	if (!arrow || !tooltipText || !tooltipElem || !tooltip) return;
	let id = crypto.randomUUID();
	tooltip.activeTooltip = id;
	await noJumpWait(0);
	if (tooltip.activeTooltip !== id) return;

	tooltipElem.style.opacity = '1';
	tooltipText.innerText = text;

	if (!e) return;
	if (typeof e === 'string') e = /**@type {HTMLElement}*/ (document.querySelector('#' + e));

	let rect = /**@type {HTMLElement}*/ (e).getBoundingClientRect();
	let tooltipRect = tooltipElem.getBoundingClientRect();
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
	tooltipElem.style.left = `${x}px`;
	tooltipElem.style.top = `${y}px`;
	let left = tooltipRect.width / 2 - arrowRect.width / 2;
	arrow.style.left = `${left}px`;
	arrow.style.top = `${0.1 + (tooltipRect.height / 2 - arrowRect.height / 2)}px`;
	arrow.style.transform = `translate(${rect.left - x - left + rect.width / 2 - arrowRect.width / 2}px, ${-tooltipRect.height / 2}px) rotate(0deg)`;
}

/**
 * @param {HTMLElement | string} elem
 * @param {number} groupId
 */
export async function removeTooltip(elem, groupId) {
	const tooltip = tooltipsGroups.get(groupId);
	if (typeof elem === 'string') {
		elem = /**@type {HTMLElement} */ (document.querySelector('#' + elem));
	}
	if (!elem) return;
	let tooltipId = elem.getAttribute('tooltip-id');
	if (tooltipId && tooltip) {
		tooltip.removeCalls.get(tooltipId)?.();
	}
}
/**
 * @param {HTMLElement | string} elem
 * @param {{id: number, text: string, willRemove?: boolean, hue?: number}} data
 */
export function setUpTooltip(elem, { id, text, willRemove = false, hue = 200 }) {
	if (typeof elem === 'string') {
		elem = /**@type {HTMLElement} */ (document.querySelector('#' + elem));
	}
	const group = tooltipsGroups.get(id);
	if (!elem || !group) return;
	let show = (/**@type {MouseEvent}*/ e) => {
		showTooltip(e.target, text, hue, id);
	};
	let hide = () => {
		hideTooltip(id);
	};

	elem.addEventListener('mouseenter', show);
	elem.addEventListener('mouseleave', hide);
	elem.addEventListener('click', hide);
	if (willRemove) {
		let id = elem.getAttribute('tooltip-id');
		if (id) {
			group.removeCalls.get(id)?.();
		} else {
			id = crypto.randomUUID();
			elem.setAttribute('tooltip-id', id);
		}
		group.removeCalls.set(id, () => {
			elem.removeEventListener('mouseenter', show);
			elem.removeEventListener('mouseleave', hide);
			elem.removeEventListener('click', hide);
		});
	}
}

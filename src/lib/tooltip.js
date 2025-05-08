/**
 * @param {MouseEvent} e
 * @param {string} text
 */
export async function showTooltip(e, text) {
	let tooltip = /**@type {HTMLElement}*/ (document.querySelector('.tooltip'));
	let tooltipText = /**@type {HTMLElement}*/ (tooltip.querySelector('#tooltip'));
	let arrow = /**@type {HTMLElement}*/ (tooltip.querySelector('.arrow'));

	if (!arrow || !tooltipText || !tooltip) return;

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
	let arrowWidth = arrowRect.width * Math.sqrt(2);
	tooltip.style.left = `${x}px`;
	tooltip.style.top = `${y}px`;
	arrow.style.left = `${tooltipRect.width / 2 - arrowRect.width / 2}px`;
	arrow.style.top = `${tooltipRect.height / 2 - arrowRect.height / 2}px`;
	arrow.style.transform = `translate(${0 / 2}px, ${-tooltipRect.height / 2}px) rotate(0deg)`;
}

export async function hideTooltip() {
	let tooltip = /**@type {HTMLElement}*/ (document.querySelector('.tooltip'));
	if (!tooltip) return;
	tooltip.style.opacity = '0';
}

/**
 * @param {HTMLElement} elem
 * @param {string} text
 */
export function setUpTooltip(elem, text) {
	elem.addEventListener('mouseenter', (e) => {
		showTooltip(e, text);
	});
	elem.addEventListener('mouseleave', () => {
		hideTooltip();
	});
}

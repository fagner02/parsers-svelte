<script>
	const config = { attributes: true, childList: true, subtree: true };

	/**
	 * @type {HTMLDivElement}
	 */
	let component;

	const observer = new MutationObserver(setSize);
	const resize = new ResizeObserver(setSize);

	function setSize() {
		const parent = /**@type {HTMLElement}*/ (component.parentElement);
		if (parent === null) return;
		const height = /**@type {number}*/ (parent.clientHeight);
		let deduct = 0;
		const map = window.getComputedStyle(parent);
		const display = map.display;
		const direction = map.flexDirection;
		if (
			(display !== 'flex' || direction === 'column') &&
			!(/**@type {string}*/ (parent.firstElementChild?.className).includes('unit'))
		) {
			for (let i = 0; i < parent.childElementCount; i++) {
				if (parent.children[i] === component) {
					break;
				}
				deduct += parent.children[i].clientHeight;
			}
		}

		if (component.style.height === `${height - deduct}px`) return;
		component.style.height = `${height - deduct}px`;
	}

	/**
	 * @param {HTMLDivElement} comp
	 */
	function setup(comp) {
		observer.observe(/**@type {Node}*/ (comp.parentNode), config);
		resize.observe(/**@type {HTMLElement}*/ (comp.parentElement));

		component = comp;
		setSize();
	}
</script>

<div use:setup class="filled {$$props.class}" style={$$props.style} id={$$props.id}>
	<slot></slot>
</div>

<style>
</style>

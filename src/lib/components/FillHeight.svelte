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
		const height = /**@type {number}*/ (parent.clientHeight - 1);
		let deduct = 0;
		const display = /**@type {any}*/ (parent.computedStyleMap().get('display')).value;
		const direction = /**@type {any}*/ (parent.computedStyleMap().get('flex-direction')).value;
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

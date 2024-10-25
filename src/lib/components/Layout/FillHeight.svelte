<script>
	const config = { attributes: true, childList: true, subtree: true };

	/** @type {HTMLDivElement} */
	let component;
	/** @type {Element} */
	let parent;
	let fillHeight = true;
	let fillWidth = true;

	const observer = new MutationObserver(setSize);
	const resize = new ResizeObserver(setSize);

	function setHeight() {
		parent = /**@type {HTMLElement}*/ (component.parentElement);
		if (parent === null) return;

		const map = window.getComputedStyle(parent);
		const compMap = window.getComputedStyle(component);
		let gap = parseFloat(map.gap);
		gap = isNaN(gap) ? 0 : gap;
		const height = /**@type {number}*/ (parent.clientHeight);
		let deduct = 0;

		if (
			(map.display !== 'flex' || map.flexDirection.includes('column')) &&
			typeof parent.firstElementChild?.className === 'string' &&
			!parent.firstElementChild?.className?.includes('unit')
		) {
			for (let i = 0; i < parent.childElementCount; i++) {
				if (parent.children[i].isSameNode(component)) {
					break;
				}
				const child = /**@type {HTMLElement}*/ (parent.children[i]);
				const childMap = window.getComputedStyle(child);

				deduct +=
					child.clientHeight +
					parseFloat(childMap.marginBottom) +
					parseFloat(childMap.marginTop) +
					parseFloat(childMap.paddingTop) +
					parseFloat(childMap.paddingBottom) +
					gap;
			}
		}
		const compInsets =
			parseFloat(compMap.paddingTop) +
			parseFloat(compMap.paddingBottom) +
			parseFloat(compMap.marginBottom) +
			parseFloat(compMap.marginTop);
		if (component.style.height === `${height - deduct - compInsets}px`) return;
		component.style.height = `${height - deduct - compInsets}px`;
	}
	function setWidth() {
		parent = /**@type {HTMLElement}*/ (component.parentElement);
		if (parent === null) return;

		const map = window.getComputedStyle(parent);
		const compMap = window.getComputedStyle(component);

		const width = /**@type {number}*/ (parent.clientWidth);
		let deduct = 0;
		if (
			map.display === 'flex' &&
			map.flexDirection.includes('row') &&
			!(/**@type {string}*/ (parent.firstElementChild?.className).includes('unit'))
		) {
			for (let i = 0; i < parent.childElementCount; i++) {
				if (parent.children[i].isSameNode(component)) {
					break;
				}
				const child = /**@type {HTMLElement}*/ (parent.children[i]);
				const childMap = window.getComputedStyle(child);
				deduct +=
					child.clientWidth +
					parseFloat(childMap.marginLeft) +
					parseFloat(childMap.marginRight) +
					parseFloat(childMap.paddingRight) +
					parseFloat(childMap.paddingLeft);
			}
		}

		const compInsets =
			parseFloat(compMap.paddingRight) +
			parseFloat(compMap.paddingLeft) +
			parseFloat(compMap.marginLeft) +
			parseFloat(compMap.marginRight);

		if (component.style.maxWidth === `${width - deduct - compInsets}px`) return;
		component.style.maxWidth = `${width - deduct - compInsets}px`;
	}

	function setSize() {
		if (fillWidth) setWidth();
		if (fillHeight) setHeight();
	}

	/**
	 * @param {HTMLDivElement} comp
	 */
	function setup(comp) {
		observer.observe(/**@type {HTMLElement}*/ (comp.parentElement), config);
		resize.observe(/**@type {HTMLElement}*/ (comp.parentElement));

		component = comp;
		setSize();
	}
</script>

<div use:setup class="filled {$$props.class ?? ''}" style={$$props.style} id={$$props.id}>
	<slot></slot>
</div>

<style>
</style>

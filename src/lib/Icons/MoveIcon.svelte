<script>
	/** @type {{color?: string, size?: number, strokeWidth?: number}} */
	let { color = 'black', size = 15, strokeWidth = 2 } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke={color}
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	class="icon icon-tabler icons-tabler-outline icon-tabler-arrows-move"
	><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 9l3 3l-3 3" /><path
		d="M15 12h6"
	/><path d="M6 9l-3 3l3 3" /><path d="M3 12h6" /><path d="M9 18l3 3l3 -3" /><path
		d="M12 15v6"
	/><path d="M15 6l-3 -3l-3 3" /><path d="M12 3v6" /></svg
>

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
	class="icon icon-tabler icons-tabler-outline icon-tabler-alert-square"
	><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
		d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"
	/><path d="M12 8v4" /><path d="M12 16h.01" /></svg
>

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
	class="icon icon-tabler icons-tabler-outline icon-tabler-window-minimize"
	><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
		d="M3 16m0 1a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1z"
	/><path d="M4 12v-6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-6" /><path
		d="M15 13h-4v-4"
	/><path d="M11 13l5 -5" /></svg
>

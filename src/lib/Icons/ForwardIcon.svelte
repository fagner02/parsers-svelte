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
	class="icon icon-tabler icons-tabler-outline icon-tabler-player-track-next"
	><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 5v14l8 -7z" /><path
		d="M14 5v14l8 -7z"
	/></svg
>

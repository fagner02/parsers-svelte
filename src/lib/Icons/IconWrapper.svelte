<script>
	/** @type {{color?: string, size?: number, strokeWidth?: number, style?: string, path: any}} */
	let { color = 'black', size = 15, strokeWidth = 2, style = '', path } = $props();
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
	{style}>{@render path()}</svg
>

<script>
	export let color = 'black';
	export let size = 15;
	export let strokeWidth = 2;
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
	class={$$props.class ?? ''}
	><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M13 5v8h-8" /><path
		d="M17 9v8h-8"
	/></svg
>

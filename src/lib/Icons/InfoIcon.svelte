<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script>
	export let color = 'black';
	export let size = 15;
	export let strokeWidth = 2;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	style={$$props.style}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke={color}
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"
	><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
		d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"
	/><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg
>

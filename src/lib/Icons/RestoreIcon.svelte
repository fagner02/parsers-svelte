<script>
	import IconWrapper from './IconWrapper.svelte';

	let { color = 'black', size = 15, strokeWidth = 2, style = '' } = $props();
</script>

<IconWrapper {size} {color} {strokeWidth} {style}>
	{#snippet path()}<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M3.06 13a9 9 0 1 0 .49 -4.087"
		/><path d="M3 4.001v5h5" /><path
			d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"
		/>{/snippet}</IconWrapper
>

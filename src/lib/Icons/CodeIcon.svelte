<script>
	import IconWrapper from './IconWrapper.svelte';

	let { color = 'black', size = 15, strokeWidth = 2, style = '' } = $props();
</script>

<IconWrapper {size} {color} {strokeWidth} {style}>
	{#snippet path()}<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M7 8l-4 4l4 4"
		/><path d="M17 8l4 4l-4 4" /><path d="M14 4l-4 16" />{/snippet}</IconWrapper
>

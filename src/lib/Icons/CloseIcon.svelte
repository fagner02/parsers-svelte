<script>
	import IconWrapper from './IconWrapper.svelte';

	let { color = 'black', size = 15, strokeWidth = 2, style = '' } = $props();
</script>

<IconWrapper {size} {color} {strokeWidth} {style}>
	{#snippet path()}<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M18 6l-12 12"
		/><path d="M6 6l12 12" />{/snippet}</IconWrapper
>

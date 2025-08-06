<script>
	import IconWrapper from './IconWrapper.svelte';

	let { color = 'black', size = 15, strokeWidth = 2, style = '' } = $props();
</script>

<IconWrapper {size} {color} {strokeWidth} {style}>
	{#snippet path()}<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"
		/><path d="M12 8v3" /><path d="M12 14v.01" />{/snippet}</IconWrapper
>

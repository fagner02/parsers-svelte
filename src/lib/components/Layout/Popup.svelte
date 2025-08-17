<script>
	import { noJumpWait } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import FillSize from './FillSize.svelte';
	import CloseButton from './CloseButton.svelte';

	/**@type {{flex?: number, opacity?: number, pos?: number, id?: string, onClose: any, children: any}}*/
	let { flex = 0.1, opacity = 0, pos = -50, ...props } = $props();

	onMount(async () => {
		await noJumpWait(200);
		flex = 1;
		await noJumpWait(200);
		opacity = 1;
		pos = 0;
	});
</script>

<FillSize
	style="display: flex;flex-direction: column;justify-content: center;padding-top: 20px;"
	class="maxWidth"
	fillWidth={false}
>
	<CloseButton onClose={props.onClose}></CloseButton>
	<div
		id={props.id}
		class="popup-box maxWidth"
		style="transform: scale({flex}, 1);height: inherit;"
	>
		{@render props.children({
			contentClass: 'popup-content',
			style: `opacity: ${opacity};transform: translate(0px, ${pos}px)`
		})}
	</div>
</FillSize>

<style>
	.popup-box {
		display: grid;
		border-radius: 10px;
		transition: all 0.5s;
		padding: 10px;
		margin: 10px;
		overflow: hidden;
		border: 1px solid hsl(200, 50%, 50%);
	}

	:global(.popup-content) {
		overflow: hidden;
		overflow: auto;
		margin: 0px;
		transition: all 0.5s 0.2s;
	}
</style>

<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script>
	import { noJumpWait } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import FillSize from './FillSize.svelte';
	import CloseButton from './CloseButton.svelte';

	/**@type {{flex?: number, opacity?: number, pos?: number, id?: string, onClose: any, children: any}}*/
	let { ...props } = $props();

	props.flex = 0.1;
	props.opacity = 0;
	props.pos = -50;

	onMount(async () => {
		await noJumpWait(200);
		props.flex = 1;
		await noJumpWait(200);
		props.opacity = 1;
		props.pos = 0;
	});
</script>

<FillSize
	style="display: flex;flex-direction: column;justify-content: center;padding-top: 20px;"
	class="maxWidth"
	fillWidth={false}
>
	{#snippet content()}
		<CloseButton onClose={props.onClose}></CloseButton>
		<div
			id={props.id}
			class="popup-box maxWidth"
			style="transform: scale({props.flex}, 1);height: inherit;"
		>
			{@render props.children({
				contentClass: 'popup-content',
				style: 'opacity: {props.opacity};transform: translate(0px, {pos}px)',
				opacity: props.opacity,
				maxWidth: props.flex,
				pos: props.pos
			})}
		</div>
	{/snippet}
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

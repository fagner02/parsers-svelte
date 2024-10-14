<script>
	import { fontSize } from '$lib/globalStyle';

	export let cardId;
</script>

<div class="grid card-wrapper" style="animation: rotA 0.5s;">
	<div class="border-selection" id="select-{cardId}"></div>
	<div
		class="card"
		id={$$props.id}
		style="min-height: {$$props.minHeight}rem; min-width:{$$props.minWidth}rem;max-width: {$$props.maxWidth}rem; max-height: {$$props.maxHeight}rem;{$$props.transition
			? `transition: ${$$props.transition}`
			: ''};{$$props.style}"
	>
		<slot></slot>
	</div>
	<div class="card-label {$$props.color}" style="font-size: {fontSize}rem;">{$$props.label}</div>
</div>

<style>
	.card-label {
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		color: white;
		width: fit-content;
	}

	.card-wrapper {
		flex-direction: column;
		align-items: start;
		border: 1px solid hsl(200, 50%, 50%);
		border-radius: 15px;
		margin: 5px;
		padding: 5px;
		width: max-content;
	}
	.border-selection {
		grid-area: unit;
	}
	.card {
		grid-area: unit;
		height: fit-content;
		background: white;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		transition: width 0.3s;
		overflow: hidden;
		width: fit-content;

		transition:
			max-width 0.5s,
			max-height 0.5s;
		text-wrap: nowrap;
	}

	.border-selection {
		border: 2px solid hsl(200, 50%, 35%);
		outline: 3px solid white;
		box-shadow: 0px 0px 6px 2px hsl(200, 50%, 0%, 40%);
		/* position: relative; */
		z-index: 1;
		border-radius: 8px;
		transition:
			width 0.5s,
			translate 0.5s,
			opacity 0.5s;
		opacity: 0;
	}
</style>

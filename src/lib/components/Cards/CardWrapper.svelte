<script>
	import { fontSize } from '$lib/globalStyle';
</script>

<div class="card-wrapper" style="animation: rotA 0.5s;">
	<div
		class="card"
		id={$$props.id}
		style="min-height: {$$props.minHeight}px; min-width:{$$props.minWidth}px;max-width: {$$props.maxWidth}px; max-height: {$$props.maxHeight}px;{$$props.transition
			? `transition: ${$$props.transition}`
			: ''};{$$props.style}"
	>
		<slot></slot>
	</div>
	<div class="card-label {$$props.color}" style="font-size: {fontSize}px;">{$$props.label}</div>
</div>

<style>
	.card-label {
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		color: white;
	}

	.card-wrapper {
		display: flex;
		flex-direction: column;
		align-items: start;
		border: 1px solid hsl(200, 50%, 50%);
		border-radius: 15px;
		margin: 5px;
		padding: 5px;
	}
	.card {
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
</style>

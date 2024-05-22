<script>
</script>

<div class="row {$$props.class}" style={$$props.style} id={$$props.id}>
	<div class="column" style={$$props.style2}>
		<slot></slot>
	</div>
</div>

<style>
	.row {
		display: flex;
		overflow: hidden;
		height: -webkit-fill-available;
		width: -webkit-fill-available;
	}
	.column {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: -webkit-fill-available;
		height: -webkit-fill-available;
	}
</style>

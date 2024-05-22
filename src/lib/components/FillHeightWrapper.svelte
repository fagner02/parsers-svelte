<script>
</script>

<div class="row {$$props.class}" style={$$props.style} id={$$props.id}>
	<div class="column {$$props.class}" style={$$props.style2}>
		<slot></slot>
	</div>
</div>

<style>
	.row {
		display: flex;
		overflow: hidden;
		height: -webkit-fill-available;
		width: -webkit-fill-available;
		width: -moz-available;
	}

	.column {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: -webkit-fill-available;
		width: -moz-available;
		height: -webkit-fill-available;
	}
	@-moz-document url-prefix() {
		.row,
		.column {
			height: 100%;
		}
	}
</style>

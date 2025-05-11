<script>
	import { appWindow } from '@tauri-apps/api/window';

	// onMount(() => {
	// 	document
	// 		.getElementById('titlebar-minimize')
	// 		?.addEventListener('click', () => appWindow.minimize());
	// 	document
	// 		.getElementById('titlebar-maximize')
	// 		?.addEventListener('click', () => appWindow.toggleMaximize());
	// 	document.getElementById('titlebar-close')?.addEventListener('click', () => appWindow.close());
	// });
</script>

{#if /**@type {any}*/ (/**@type {any}*/ (window))?.__TAURI__ !== undefined}
	<div data-tauri-drag-region class="titlebar">
		<div style="margin-left: 10px;display: grid; place-content: center">Parsers</div>
		<div style="display: flex;">
			<button class="titlebar-button" id="titlebar-minimize" onclick={appWindow.minimize}>
				<img width="15px" src="minus.svg" alt="minimize" />
			</button>
			<button class="titlebar-button" id="titlebar-maximize" onclick={appWindow.toggleMaximize}>
				<img width="15px" src="square.svg" alt="maximize" />
			</button>
			<button class="titlebar-button" id="titlebar-close" onclick={appWindow.close}>
				<img width="15px" src="square-x.svg" alt="close" />
			</button>
		</div>
	</div>
{/if}

<style>
	.titlebar {
		height: 30px;
		background: hsl(200, 50%, 100%);
		user-select: none;
		display: flex;
		justify-content: flex-end;
		position: relative;
		top: 0;
		left: 0;
		right: 0;
		border-radius: 5px 5px 0px 0px;
		display: flex;
		justify-content: space-between;
		align-content: space-between;
	}
	.titlebar-button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		width: 30px;
		height: 30px;
		transition: none;
	}
	.titlebar-button {
		transform: scale(1);
		background: none;
		box-shadow: none;
	}
	.titlebar-button:hover {
		background: #5bbec3;
	}
</style>

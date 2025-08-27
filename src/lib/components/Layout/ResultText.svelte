<script>
	import CopyIcon from '@icons/CopyIcon.svelte';
	import Popup from './Popup.svelte';
	import { wait } from '$lib/flowControl';

	/** @type {{onClose: any, tabId: string, results: import("@/types").ResultsTabItem[]}} */
	let { onClose, ...props } = $props();

	/**
	 * @param {string} content
	 * @param {number} index
	 */
	function copy(content, index) {
		navigator.clipboard.writeText(content).then(async () => {
			let elem = document
				.querySelector(`#result-text-${props.tabId}`)
				?.querySelector(`#resbutton${index}`);
			if (!elem) return;
			elem.classList.add('copied');
			await wait('', 1000);
			elem.classList.remove('copied');
		});
	}
</script>

<Popup class="result-text" id="result-text-{props.tabId}" {onClose}>
	{#snippet children(/**@type {{ style:string, contentClass:string }}*/ params)}
		<div class="result-text-content {params.contentClass}" style={params.style}>
			{#each props.results as result, i}
				<div class="result-title">
					<h4>{result.title}</h4>
					<button
						id="resbutton{i}"
						onclick={() => {
							copy(result.content, i);
						}}
					>
						<CopyIcon></CopyIcon>
					</button>
				</div>
				<p>{result.content}</p>
				<hr />
			{/each}
		</div>
	{/snippet}
</Popup>

<style>
	:global(.result-text) {
		background: hsl(200, 60%, 100%);
		border: 1px solid hsl(200, 60%, 50%);
		box-shadow: 0px 0px 10px 0px hsl(0, 0%, 0%, 20%);
	}
	.result-title {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.result-title > button {
		background: hsl(0, 0%, 100%);
		border: 1px solid hsl(200, 60%, 0%);
		padding: 5px;
		transition: all 0.5s;
	}
	.result-title > button::after {
		content: ' Copiado';
		font-size: 0.8rem;
		color: white;
		position: absolute;
		border-radius: 5px;
		background-color: hsl(0, 0%, 30%);
		padding: 0 5px;
		transform: translate(-25px, 0px);
		opacity: 0;
		transition: all 0.3s;
	}
	:global(button.copied) {
		background: hsl(0, 0%, 80%) !important;
	}

	:global(button.copied::after) {
		transform: translate(-25px, 25px) !important;
		opacity: 1 !important;
	}
	h4 {
		margin: 0;
	}
	p {
		margin: 10px 0;
		white-space: pre-wrap;
	}
</style>

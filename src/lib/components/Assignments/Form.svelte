<script>
	import { goto } from '$app/navigation';
	import FillSize from '@/Layout/FillSize.svelte';
	import { onMount } from 'svelte';
	import '@/Assignments/assignment.css';
	import { uploadFile } from '$lib/log';

	let { form, name, receiveInput = $bindable() } = $props();
	let totalQuestions = $state(0);
	let totalAnswers = $state(0);
	let fileSent = $state(false);

	/**@type {Map<string,{filled: boolean,req: boolean}>}*/
	let answers = new Map();

	/**
	 * @param {Event} e
	 */
	receiveInput = (e) => {
		const elem = /**@type {HTMLInputElement}*/ (e.target);

		if (elem.value.trim().length > 0) {
			answers.set(elem.name, { filled: true, req: !elem.getAttribute('data-optional') });
		} else {
			answers.set(elem.name, { filled: false, req: !elem.getAttribute('data-optional') });
		}
		if (elem.type === 'checkbox' || elem.type === 'radio') {
			let empty = true;
			/**@type {NodeListOf<HTMLInputElement>}*/ (
				document.querySelectorAll(`input[name="${elem.name}"]`)
			).forEach((x) => {
				if (x.checked) {
					localStorage.setItem('vansi-form-' + name + x.id, x.value);
					empty = false;
				} else {
					localStorage.removeItem('vansi-form-' + name + x.id);
				}
			});
			const item = answers.get(elem.name);
			if (item) item.filled = !empty;
		} else {
			localStorage.setItem('vansi-form-' + name + elem.name, elem.value);
		}
		totalAnswers = answers
			.values()
			.filter((x) => x.filled && x.req)
			.toArray().length;
	};

	/**@param {MouseEvent} e*/
	function rangeInput(e) {
		receiveInput(e);
		if (e.target) /**@type {HTMLElement}*/ (e.target).onclick = null;
	}

	function sendForm() {
		let content = '';
		answers.entries().forEach(([k, v]) => {
			const elem = /**@type {HTMLInputElement}*/ (document.querySelector(`[name="${k}"]`));
			if (elem.type === 'checkbox' || elem.type === 'radio') {
				/**@type {NodeListOf<HTMLInputElement>}*/ (
					document.querySelectorAll(`input[name="${elem.name}"]`)
				).forEach((x) => {
					if (x.checked) {
						content += `${x.id}:${x.value}`;
					}
				});
				content += '\n';
			} else {
				content += `${k}:${elem.value?.replaceAll('\\', '\\\\').replaceAll('\n', '\\n')}\n`;
			}
		});

		if (import.meta.env.PROD) {
			uploadFile('form-' + name + crypto.randomUUID(), content);
		} else {
			console.log(content);
		}
		goto('/');
	}

	onMount(() => {
		const qs = /**@type {NodeListOf<HTMLInputElement>}*/ (
			document.querySelector('.form')?.querySelectorAll('input,textarea')
		);
		qs?.values().forEach((x) => {
			x.oninput = receiveInput;
			if (x.type === 'range') {
				x.onclick = rangeInput;
			}
			if (x.type === 'checkbox' || x.type === 'radio') {
				const item = localStorage.getItem('vansi-form-' + name + x.id);
				if (item) {
					x.checked = true;
					answers.set(x.name, {
						filled: true,
						req: !x.getAttribute('data-optional')
					});
				} else {
					answers.set(x.name, {
						filled: answers.get(x.name)?.filled ?? false,
						req: !x.getAttribute('data-optional')
					});
				}
			} else {
				const item = localStorage.getItem('vansi-form-' + name + x.name);
				if (item) {
					x.value = item;

					answers.set(x.name, {
						filled: true,
						req: !x.getAttribute('data-optional')
					});
				} else {
					answers.set(x.name, {
						filled: false,
						req: !x.getAttribute('data-optional')
					});
				}
			}
		});
		totalQuestions = answers
			.values()
			.filter((x) => x?.req)
			.toArray().length;
		totalAnswers = answers
			.values()
			.filter((x) => x.filled && x.req)
			.toArray().length;
	});
</script>

<FillSize class="unit" style="margin: 10px">
	<div class="form">
		<div class="form-header">
			<p style="align-content: center">
				Progresso: {totalAnswers}/{totalQuestions}
			</p>
			<button
				disabled={totalAnswers < totalQuestions || fileSent}
				onclick={() => {
					fileSent = true;
					sendForm();
				}}>{fileSent ? 'Enviado' : 'Finalizar'}</button
			>
		</div>
		<FillSize class="form-content">
			<datalist id="values">
				<option value="1"></option>
				<option value="2"></option>
				<option value="3"></option>
				<option value="4"></option>
				<option value="5"></option>
			</datalist>
			<div class="fields" style={!fileSent ? 'opacity: 1' : 'pointer-events:none;opacity: 0.5'}>
				{@render form()}
			</div>
		</FillSize>
	</div>
</FillSize>

<style>
</style>

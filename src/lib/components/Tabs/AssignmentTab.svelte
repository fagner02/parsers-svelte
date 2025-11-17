<script>
	import { appendData, createFile, getFile } from '$lib/log';
	import FillSize from '@/Layout/FillSize.svelte';
	import { onMount } from 'svelte';
	import { noJumpWait } from '$lib/flowControl';
	import { goto } from '$app/navigation';
	import '@/Assignments/assignment.css';

	const urlParams = new URLSearchParams(window.location.search);
	let campus = $state(urlParams.get('campus') ?? '');
	let n = $state(urlParams.get('n') ?? '');

	let totalQuestions = $state(0);
	let totalAnswers = $state(0);
	let started = $state(false);
	let fileSent = $state(false);

	/**@type {import("svelte").Component?}*/
	let Assignment = $state(null);

	let answers = new Set();
	/**
	 * @param {Event} e
	 */
	function receiveInput(e) {
		const { name, value } = /**@type {HTMLInputElement}*/ (e.target);
		appendData(
			`form ${name},${value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\c')}`
		);
		localStorage.setItem('vansi-' + name, value);
		if (value.trim().length > 0) {
			answers.add(name);
		} else {
			answers.delete(name);
		}
		totalAnswers = answers.size;
	}

	onMount(async () => {
		switch (campus) {
			case 'ru':
				Assignment = (await import('../Assignments/RussasAssingment.svelte')).default;
				break;
			default:
				Assignment = (await import('../Assignments/DefaultAssingment.svelte')).default;
				break;
		}
		await noJumpWait(0);
		const inputs = document.querySelector('.form')?.querySelectorAll('input,textarea');
		inputs?.forEach((x) => {
			const name = /**@type {HTMLInputElement}*/ (x).name;
			const item = localStorage.getItem('vansi-' + name);
			if (item) {
				/**@type {HTMLInputElement}*/ (x).value = item;
				answers.add(name);
			}
		});
		totalQuestions = inputs?.length ?? 0;
		totalAnswers = answers.size;
		if (localStorage.getItem('vansi-file-sent')) {
			started = true;
			fileSent = true;
		}
	});
</script>

<FillSize class="unit">
	<div class="form">
		<div class="form-header">
			<button
				disabled={started}
				onclick={() => {
					createFile();
					started = true;
				}}>Iniciar</button
			>
			<p style="font-size: 0.9rem;align-content: center">
				Progresso: {totalAnswers}/{totalQuestions}
			</p>
			<button
				disabled={totalAnswers < totalQuestions || fileSent || !started}
				onclick={() => {
					fileSent = true;
					getFile();
					goto('/forms/aluno');
				}}>{fileSent ? 'Finalizado' : 'Finalizar'}</button
			>
		</div>
		<FillSize class="form-content">
			<div
				class="fields"
				style={started && !fileSent ? 'opacity: 1' : 'pointer-events:none;opacity: 0.5'}
			>
				<hr style="margin-top: 0;" />
				<div class="field" style="flex: 1">
					<p>Nome Completo</p>
					<input oninput={receiveInput} name="name" id="name" />
				</div>
				<div style="display: flex;flex-wrap:wrap;">
					<div class="field">
						<p>Email</p>
						<input name="email" id="email" type="email" oninput={receiveInput} />
					</div>
					<div class="field">
						<p>Matrícula</p>
						<input oninput={receiveInput} name="matricula" id="matricula" />
					</div>
				</div>

				<hr />
				<Assignment {receiveInput}></Assignment>
			</div>
		</FillSize>
	</div>
</FillSize>

<style>
</style>

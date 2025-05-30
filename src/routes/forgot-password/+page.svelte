<script lang="ts">
	import { onMount } from 'svelte';
	import { SITE_URL, supabase } from '$lib/log';

	let email = $state('');
	let sent = $state(false);
	let loading = $state(false);

	onMount(async () => {});

	async function handleSubmit(event: Event) {
		event.preventDefault();

		try {
			loading = true;
			const res = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${SITE_URL}/reset-password`
			});
			if (res.error !== null) {
				console.error(res.error);
				return;
			}
			sent = true;
			loading = false;
		} catch (err) {}
	}
</script>

<form class="login-container" onsubmit={handleSubmit}>
	<h2>Recuperar senha</h2>

	<div class="form-group">
		<input id="email" type="email" bind:value={email} placeholder="Email" required />
	</div>

	<button class="login" type="submit" disabled={loading}>
		{loading ? 'Enviando...' : 'Enviar email de recuperação'}
	</button>

	<p class={sent ? '' : 'hide'}>Email de recuperação enviado para {email}</p>

	<a href="/login">Voltar ao login </a>
</form>

<style>
	.login-container {
		border-radius: 10px;
		border: 1px solid grey;
		place-self: center;
		width: 300px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	h2 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #333;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.form-group:first-child {
		margin-bottom: 1.25rem;
	}

	label {
		color: grey;
	}

	input {
		outline: none;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		transition: border 0.3s;
	}

	input:focus {
		border-color: #646cff;
		outline: none;
	}

	p {
		font-size: 0.8rem;
		transition: all 0.5s;
		overflow: hidden;
		opacity: 1;
		max-height: 60px;
		margin: 0;
		text-align: center;
	}
	p.hide {
		opacity: 0;
		max-height: 0;
		margin: -5px;
	}

	button.login {
		width: 100%;
		padding: 0.75rem;
		background: #646cff;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.3s;
	}

	button.login:hover {
		background: #535bf2;
	}

	button.login:disabled {
		background: #cccccc;
		cursor: not-allowed;
	}

	a {
		font-size: 0.9rem;
		color: #646cff;
		text-decoration: none;
		font-weight: 500;
		text-align: center;
	}
</style>

<script lang="ts">
	import { supabase } from '$lib/log';
	import EyeIcon from '@icons/EyeIcon.svelte';
	import EyeOffIcon from '@icons/EyeOffIcon.svelte';
	let password = $state('');
	let isLoading = $state(false);
	let sent = $state(false);
	let passVisible = $state(false);
	let passwordError = $state(false);

	function validatePassword() {
		passwordError = !(password.length >= 6);
		return passwordError;
	}

	function getAccessTokenFromUrl() {
		const hash = window.location.hash.substring(1);
		const params = new URLSearchParams(hash);
		return { access: params.get('access_token') ?? '', refresh: params.get('refresh_token') ?? '' };
	}

	let tokens = getAccessTokenFromUrl();

	async function handleSubmit(event: Event) {
		event.preventDefault();

		try {
			isLoading = true;
			if (!tokens.access) {
				throw new Error('Invalid access token');
			}
			const res = await supabase.auth.setSession({
				access_token: tokens.access,
				refresh_token: tokens.refresh
			});
			if (res.error !== null) {
				throw res.error;
			}

			const updateRes = await supabase.auth.updateUser({ password: password });
			if (updateRes.error !== null) {
				throw updateRes.error;
			}
			sent = true;
		} catch (err) {
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
</script>

<form class="login-container" onsubmit={handleSubmit}>
	<h2>Alterar senha</h2>

	<div class="form-group">
		<div class="grid">
			<input
				class="unit"
				id="password"
				type={passVisible ? 'text' : 'password'}
				bind:value={password}
				oninput={validatePassword}
				placeholder="Nova senha"
				required
			/>
			<button
				class="unit show-pass"
				onclick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					passVisible = !passVisible;
				}}
			>
				{#if passVisible}
					<EyeIcon size={24}></EyeIcon>
				{:else}
					<EyeOffIcon size={24}></EyeOffIcon>
				{/if}
			</button>
		</div>
		<div class="validation-error {passwordError ? '' : 'hide'}">
			Senha deve conter pelo menos 6 caracteres
		</div>
	</div>

	<button class="login" type="submit" disabled={isLoading}> Alterar senha </button>

	<p class={sent ? '' : 'hide'}>Senha alterada com sucesso</p>

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

	p {
		text-align: center;
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

	.validation-error {
		color: #d32f2f;
		font-size: 0.8rem;
		transition: all 0.5s;
		overflow: hidden;
		opacity: 1;
		max-height: 60px;
		place-self: center;
		margin-left: 10px;
	}
	.validation-error.hide {
		max-height: 0px;
		opacity: 0px;
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

	button.show-pass {
		display: grid;
		place-content: center;
		place-self: center end;
		margin-right: 12px;
		background: none;
		pointer-events: all;
	}

	a {
		font-size: 0.9rem;
		color: #646cff;
		text-decoration: none;
		font-weight: 500;
		text-align: center;
	}
</style>

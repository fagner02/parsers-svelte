<script lang="ts">
	import EyeIcon from '@icons/EyeIcon.svelte';
	import EyeOffIcon from '@icons/EyeOffIcon.svelte';
	import { SITE_URL as SITE_URL, supabase } from '$lib/log';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let showError = $state(false);
	let passVisible = $state(false);
	let emailError = $state(false);
	let passwordError = $state(false);
	let sent = $state(false);

	function validateEmail() {
		showError = false;
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		emailError = !re.test(email);
		return emailError;
	}

	function validatePassword() {
		showError = false;
		passwordError = !(password.length >= 6);
		return passwordError;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (validateEmail() || validatePassword()) return;

		isLoading = true;
		showError = false;

		try {
			const res = await supabase.auth.signUp({
				email: email,
				password: password,
				options: {
					emailRedirectTo: SITE_URL
				}
			});

			if (res.error !== null) {
				error = res.error.message;
				showError = true;
				throw res.error;
			}
			sent = true;
		} catch (err) {
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="login-container">
	<h2>Registro</h2>

	<form onsubmit={handleSubmit}>
		<div class="form-group">
			<label for="email">Email</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				oninput={validateEmail}
				placeholder="your@email.com"
				required
			/>

			<div class="validation-error {emailError ? '' : 'hide'}">Email inválido</div>
		</div>

		<div class="form-group">
			<label for="password">Senha</label>
			<div class="grid">
				<input
					class="unit"
					id="password"
					type={passVisible ? 'text' : 'password'}
					bind:value={password}
					oninput={validatePassword}
					placeholder="••••••••"
					required
				/>
				<button
					class="unit show-pass"
					onclick={(e) => {
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

		<div class="validation-error {showError ? '' : 'hide'}">
			{error}
		</div>

		<p class={sent ? '' : 'hide'}>Email de confirmação enviado para {email}</p>

		<button class="login" type="submit" disabled={isLoading}>
			{isLoading ? 'Registrando...' : 'Registrar'}
		</button>
	</form>

	<div class="signup-link">
		Já tem uma conta? <a href="/login">Faça log-in</a>
	</div>
</div>

<style>
	.login-container {
		border-radius: 10px;
		border: 1px solid grey;
		place-self: center;
		width: fit-content;
		width: 300px;
		padding: 20px;
	}

	h2 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #333;
	}

	p {
		transition: all 0.5s;
		max-height: 60px;
		opacity: 1;
		margin-bottom: 10px;
		text-align: center;
	}
	p.hide {
		max-height: 0px;
		opacity: 0;
	}

	.form-group {
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
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
		margin-top: 0.25rem;
		transition: all 0.5s;
		overflow: hidden;
		opacity: 1;
		max-height: 20px;
	}
	.validation-error.hide {
		opacity: 0;
		max-height: 0px;
		margin: 0;
	}
	form > .validation-error {
		text-align: center;
		margin-bottom: 10px;
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

	.signup-link {
		text-align: center;
		margin-top: 1.5rem;
		font-size: 0.9rem;
		color: #555;
	}

	.signup-link a {
		color: #646cff;
		text-decoration: none;
		font-weight: 500;
	}
</style>

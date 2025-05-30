<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import EyeIcon from '@icons/EyeIcon.svelte';
	import EyeOffIcon from '@icons/EyeOffIcon.svelte';
	import { supabase } from '$lib/log';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = '';
	let passVisible = $state(false);
	let rememberMe = $state(false);
	let credentialsError = $state(false);

	onMount(() => {
		if (browser) {
			const savedEmail = localStorage.getItem('rememberedEmail');
			if (savedEmail) {
				email = savedEmail;
				rememberMe = true;
			}
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();

		isLoading = true;
		error = '';

		try {
			const res = await supabase.auth.signInWithPassword({ email: email, password: password });
			if (res.error !== null) {
				console.error(res.error);
				credentialsError = true;
				return;
			}
			supabase.auth.resetPasswordForEmail(email);
			if (browser) {
				if (rememberMe) {
					localStorage.setItem('rememberedEmail', email);
				} else {
					localStorage.removeItem('rememberedEmail');
				}
			}

			await goto('/');
		} catch (err) {
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="login-container">
	<h2>Login</h2>

	<form onsubmit={handleSubmit}>
		<div class="form-group">
			<label for="email">Email</label>
			<input id="email" type="email" bind:value={email} placeholder="your@email.com" required />
		</div>

		<div class="form-group">
			<label for="password">Senha</label>
			<div class="grid">
				<input
					class="unit"
					id="password"
					type={passVisible ? 'text' : 'password'}
					bind:value={password}
					placeholder="••••••••"
					required
				/>
				<button
					class="unit show-pass"
					onclick={(e) => {
						e.stopImmediatePropagation();
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
		</div>

		<div class="validation-error {credentialsError ? '' : 'hide'}">Senha ou email inválidos</div>

		<div class="form-options">
			<label class="checkbox-container">
				<input type="checkbox" bind:checked={rememberMe} />
				Remember me
			</label>
			<a href="/forgot-password" class="forgot-password">Forgot password?</a>
		</div>

		<button class="login" type="submit" disabled={isLoading}>
			{isLoading ? 'Fazendo login...' : 'Login'}
		</button>
	</form>

	<div class="signup-link">
		Não tem uma conta? <a href="/signup">Registre-se</a>
	</div>
</div>

<style>
	.login-container {
		border-radius: 10px;
		border: 1px solid grey;
		place-self: center;
		width: fit-content;
		min-width: 300px;
		padding: 20px;
	}

	h2 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #333;
	}

	.form-group {
		display: flex;
		flex-direction: column;
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
		margin-top: 15px;
		transition: all 0.5s;
		overflow: hidden;
		opacity: 1;
		max-height: 20px;
		place-self: center;
	}
	.validation-error.hide {
		opacity: 0;
		max-height: 0;
		margin-top: 0;
	}

	.form-options {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 1rem 0;
	}
	.form-options > label {
		display: flex;
	}

	.forgot-password {
		font-size: 0.9rem;
		color: #646cff;
		text-decoration: none;
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

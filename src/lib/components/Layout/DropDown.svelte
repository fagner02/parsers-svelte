<script>
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/log';
	import { removeTooltip, setUpTooltip } from '@/Layout/tooltip.svelte';
	import GoogleIcon from '@icons/GoogleIcon.svelte';
	import UserIcon from '@icons/UserIcon.svelte';
	import { onMount } from 'svelte';

	let isOpen = $state(false);
	let showEmailLogin = $state(false);
	let loggingOut = $state(false);
	let authError = $state('');
	/**@type {HTMLElement | null}*/
	let dropdownElem = null;
	/**@type {HTMLElement | null}*/
	let dropdownParent = null;
	/**@type {import('@supabase/supabase-js').User | null}*/
	let currentUser = $state(null);

	/**
	 * @param {Event } e
	 */
	function toggleDropdown(e) {
		e.stopPropagation();
		e.preventDefault();
		isOpen = !isOpen;
		if (!dropdownParent) return;
		if (isOpen) removeTooltip(dropdownParent, 0);
		else
			setUpTooltip(dropdownParent, {
				id: 0,
				text: 'Opções de login',
				willRemove: true
			});
	}

	/**
	 * @param {MouseEvent} event
	 */
	function handleClickOutside(event) {
		if (!isOpen || !dropdownElem) return;
		const rect = dropdownElem?.getBoundingClientRect();
		if (!rect) return;
		if (
			event.clientX < rect?.left ||
			event.clientX > rect?.right ||
			event.clientY < rect.top ||
			event.clientY > rect.bottom
		) {
			isOpen = false;
			if (dropdownParent)
				setUpTooltip(dropdownParent, {
					id: 0,
					text: 'Opções de login',
					willRemove: true
				});
		}
	}

	/**
	 * @param {import('@supabase/supabase-js').Provider} provider
	 */
	async function handleOAuthLogin(provider) {
		authError = '';
		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: window.location.origin
			}
		});

		if (error) {
			authError = error.message;
		}
	}

	/**@param {MouseEvent} e*/
	async function handleLogout(e) {
		e.preventDefault();
		e.stopPropagation();
		try {
			loggingOut = true;
			const session = await supabase.auth.getSession();
			const res = await supabase.auth.admin.signOut(session.data.session?.access_token ?? '');
			if (res.error !== null) console.error(res.error);

			loggingOut = false;
		} catch (e) {
			console.error(e);
		}
		currentUser = null;
		showEmailLogin = false;
		isOpen = false;
		if (dropdownParent)
			setUpTooltip(dropdownParent, {
				id: 0,
				text: 'Opções de login',
				willRemove: true
			});
	}

	onMount(async () => {
		supabase.auth.onAuthStateChange(async (e) => {
			if (e === 'SIGNED_OUT') {
				showEmailLogin = false;
			}
			const {
				data: { user }
			} = await supabase.auth.getUser();
			currentUser = user;
		});
		const {
			data: { user }
		} = await supabase.auth.getUser();
		currentUser = user;

		document.addEventListener('click', handleClickOutside);
	});

	/**
	 * @param {HTMLElement} elem
	 */
	function setDropDownElem(elem) {
		dropdownElem = elem;
	}

	/**
	 * @param {HTMLElement} elem
	 */
	function setDropDownParent(elem) {
		dropdownParent = elem;
	}
</script>

<div
	class="dropdown"
	use:setDropDownParent
	use:setUpTooltip={{ id: 0, text: 'Opções de login', willRemove: true }}
>
	<button
		onclick={toggleDropdown}
		class="dropdown-button"
		style={isOpen ? 'background: hsl(200,50%,50%)' : 'transparent'}
		aria-label="User menu"
		aria-expanded={isOpen}
	>
		<UserIcon size={24} color={isOpen ? 'white' : 'hsl(200,50%,50%)'} />
	</button>
	{#if isOpen}
		<div class="dropdown-container" use:setDropDownElem>
			{#if currentUser}
				<div class="current-user">
					<p>Logged in as</p>
					<p>{currentUser.email}</p>
				</div>
				<button onclick={(e) => handleLogout(e)} style="background: hsl(200, 45%, 60%);">
					{#if loggingOut}
						Saindo...
					{:else}
						Sair
					{/if}
				</button>
			{:else}
				<button onclick={() => goto('/signup')}>Registrar Email</button>
				<button onclick={() => goto('/login')}> Entrar com Email </button>
				<button onclick={() => handleOAuthLogin('google')} style="align-items: center">
					<div class="google-box">
						<GoogleIcon size={16}></GoogleIcon>
					</div>
					Entrar com Google
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.current-user {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.google-box {
		display: flex;
		padding: 3px;
		border-radius: 100%;
		background: white;
	}
	.dropdown-container {
		animation: fadeIn 0.1s ease-out;
		position: absolute;
		z-index: 2;
		border: 1px solid hsl(200, 50%, 40%);
		border-radius: 8px;
		overflow: hidden;
		background: hsl(200, 50%, 50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		color: white;
		padding: 10px;
		width: max-content;
		left: 0;
		gap: 5px;
		margin: 5px;
	}

	@media (max-width: 860px) {
		.dropdown-container {
			right: 0;
			left: unset;
		}
	}
	button {
		color: inherit;
		background: none;
		padding: 2px 5px;
	}
	button:hover {
		background: hsl(200, 45%, 60%);
	}

	button {
		display: flex;
		gap: 5px;
	}

	.dropdown-button {
		padding: 0;
	}
	.dropdown-button:hover {
		background: transparent;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

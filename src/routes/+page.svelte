<script>
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	let isNavigating = false;

	beforeNavigate(() => (isNavigating = true));
	afterNavigate(() => (isNavigating = false));
	import { noJumpWait } from '$lib/flowControl';
	import Tabs from '@/Tabs/Tabs.svelte';
	import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen';
	AndroidFullScreen.isImmersiveModeSupported()
		.then(() => AndroidFullScreen.immersiveMode())
		.catch(console.warn);

	const hash = window.location.hash.substring(1);
	const params = new URLSearchParams(hash);

	if (params.get('type') === 'recovery') {
		window.location.href = `/reset-password#${window.location.hash.substring(1)}`;
	}
	(async () => {
		while (isNavigating) {
			await noJumpWait(100);
		}

		let div = /**@type {HTMLElement}*/ (document.querySelector("div[name='discard']"));
		if (div === null) return;

		await noJumpWait(100);
		div.style.opacity = '0';
		div.style.transform = 'translate(0px, -20px)';
		await noJumpWait(1000);
		div.remove();
		return;
	})();
</script>

<Tabs class="unit "></Tabs>

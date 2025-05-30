<script>
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
</script>

<Tabs class="unit "></Tabs>

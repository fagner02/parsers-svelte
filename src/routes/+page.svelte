<script>
	import Tabs from '@/Tabs/Tabs.svelte';
	import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen';
	AndroidFullScreen.isImmersiveModeSupported()
		.then(() => AndroidFullScreen.immersiveMode())
		.catch(console.warn);
</script>

<Tabs class="unit "></Tabs>

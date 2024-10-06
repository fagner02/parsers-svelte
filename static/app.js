// import { appWindow } from '@tauri-apps/api/window';

// document.getElementById('titlebar-minimize')?.addEventListener('click', () => appWindow.minimize());
// document
// 	.getElementById('titlebar-maximize')
// 	?.addEventListener('click', () => appWindow.toggleMaximize());
// document.getElementById('titlebar-close')?.addEventListener('click', () => appWindow.close());
window.onload = (eev) => {
	console.log(document.getElementsByTagName('style'));

	const divs = document.getElementsByTagName('div');
	for (let div of divs) {
		console.log(div.attributes.getNamedItem('name')?.value === 'discard');
		if (div.attributes.getNamedItem('name')?.value === 'discard') {
			div.style.opacity = '0';
			div.style.translate = '0px -20px';
			// setTimeout(() => div.remove(), 1000);
			break;
		}
	}
};

/** @param {number} ms */
async function wait(ms) {
	return new Promise((resolve, _) => {
		setTimeout(resolve, ms);
	});
}
const font = new FontFace('spacemono', 'url(/fonts/SpaceMono-Regular.ttf)');
document.fonts.add(font);
font.load();
window.onload = async (_) => {
	let div = document.querySelector("div[name='discard']");
	if (div === null) return;

	while (true) {
		if (
			document.head.querySelectorAll('link').length > 1 ||
			document.head.querySelectorAll('style').length > 1
		) {
			await wait(100);
			div.style.opacity = '0';
			div.style.transform = 'translate(0px, -20px)';
			await wait(1000);
			div.remove();
			return;
		}

		await wait(100);
	}
};

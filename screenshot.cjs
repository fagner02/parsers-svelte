const puppeteer = require('puppeteer');

function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const args = process.argv.slice(2);

console.log('Arguments passed:', args);

(async () => {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	await page.setViewport({ width: parseFloat(args[1]), height: parseFloat(args[2]) });

	await page.goto('https://vansi.netlify.app', { waitUntil: 'networkidle2' });

	const [el] = await page.$$(`xpath=//button[text()="${args[0]}"]`);
	await el.click();
	await wait(1000);

	await page.screenshot({
		path: `screenshots/${args[0]}-${args[1]}x${args[2]}.png`,
		fullPage: true
	});

	console.log('Screenshot saved!');
	await browser.close();
})();

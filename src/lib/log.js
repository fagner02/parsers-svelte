import { createClient } from '@supabase/supabase-js';

export let started = false;
let mousePos = { x: 0, y: 0 };
let docId = crypto.randomUUID();
/**@return {Promise<IDBDatabase?>}*/
function getIDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('ParsersFileStore', 1);
		request.onupgradeneeded = (event) => {
			const db = /**@type {IDBOpenDBRequest}*/ (event?.target)?.result;
			db.createObjectStore('files', {
				keyPath: 'name'
			});
		};
		request.onsuccess = (event) => {
			const db = /**@type {IDBOpenDBRequest}*/ (event?.target)?.result;
			resolve(db);
		};
		request.onerror = (event) => {
			reject(null);
		};
	});
}

export async function createFile() {
	const db = await getIDB();
	if (!db) {
		console.error('Error opening IndexedDB');
		return;
	}
	const transaction = db.transaction('files', 'readwrite');
	const store = transaction.objectStore('files');
	store.add({ name: docId, content: 'timestamp,type,desc' }).onsuccess = (event) => {
		console.log('File created successfully');
	};
	started = true;
}

/**@param {string} data*/
export async function appendData(data) {
	if (!started) {
		return;
	}
	const db = await getIDB();
	if (!db) {
		console.error('Error opening IndexedDB');
		return;
	}
	const transaction = db.transaction('files', 'readwrite');
	const store = transaction.objectStore('files');
	store.get(docId).onsuccess = (event) => {
		const file = /**@type {IDBRequest}*/ (event?.target)?.result;
		if (!file) {
			console.error('File not found');
			return;
		}
		file.content += `\n${new Date().toISOString()},${data}`;
		store.put(file).onerror = (event) => {
			console.error('Error updating file:', event);
		};
	};
}

export async function getFile() {
	let db = await getIDB();
	if (!db) {
		console.error('Error opening IndexedDB');
		return;
	}
	const transaction = db.transaction('files', 'readonly');
	const store = transaction.objectStore('files');
	store.get(docId).onsuccess = (event) => {
		const file = /**@type {IDBRequest}*/ (event?.target)?.result;
		if (!file) {
			console.error('File not found');
			return;
		}
		console.log('File content:', file.content);
	};
}
window.addEventListener('click', (event) => {
	appendData(
		`w click,${event.clientX} ${event.clientY};${window.innerWidth} ${window.innerHeight}`
	);
});
window.addEventListener('mousemove', (event) => {
	mousePos.x = event.clientX;
	mousePos.y = event.clientY;
});
window.setInterval(() => {
	appendData(`mouse pos,${mousePos.x} ${mousePos.y};${window.innerWidth} ${window.innerHeight}`);
}, 500);

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

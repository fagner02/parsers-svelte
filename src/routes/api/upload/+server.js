import { json } from '@sveltejs/kit';
import B2 from 'backblaze-b2';

const b2 = new B2({
	applicationKeyId: import.meta.env.VITE_B2_KEY_ID,
	applicationKey: import.meta.env.VITE_B2_APP_KEY
});

/**
 * @param {{request: Request}} request
 */
export async function POST({ request }) {
	try {
		const { fileName, content } = await request.json();
		await b2.authorize();

		const response = await b2.getUploadUrl({
			bucketId: import.meta.env.VITE_B2_BUCKET_ID || process.env.B2_BUCKET_ID
		});

		await b2.uploadFile({
			data: Buffer.from(content, 'utf-8'),
			fileName: fileName,
			uploadAuthToken: response.data.authorizationToken,
			uploadUrl: response.data.uploadUrl
		});

		return json({ data: 'Uploaded', status: 200 });
	} catch (error) {
		return json({ error: 'Upload failed' }, { status: 500 });
	}
}

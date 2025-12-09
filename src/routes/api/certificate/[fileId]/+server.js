import { json } from '@sveltejs/kit';
import B2 from 'backblaze-b2';

const b2 = new B2({
	applicationKeyId: import.meta.env.VITE_B2_KEY_ID,
	applicationKey: import.meta.env.VITE_B2_APP_KEY
});

/**
 * @param {{params: {fileId: string}}} param0
 */
export async function GET({ params }) {
	try {
		const { fileId } = params;
		await b2.authorize();

		const response = await b2.downloadFileById({
			fileId: fileId,
			responseType: 'arraybuffer'
		});

		return new Response(response.data, {
			status: 200,
			headers: {
				'Content-Type': response.headers['content-type'] || 'application/pdf',
				'Content-Disposition': `attachment; filename="certificado.pdf"`,
				'Content-Length': response.headers['content-length']
			}
		});
	} catch (error) {
		return json({ error: error, params }, { status: 500 });
	}
}

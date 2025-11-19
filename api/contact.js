const { HttpError, sendContactEmail } = require('../lib/contactMailer');

function parseRequestBody(req) {
	if (req.body) {
		if (typeof req.body === 'string') {
			try {
				return JSON.parse(req.body);
			} catch (error) {
				throw new HttpError(400, 'Invalid JSON payload.');
			}
		}
		return req.body;
	}

	return new Promise((resolve, reject) => {
		let data = '';
		req.on('data', (chunk) => {
			data += chunk;
		});
		req.on('end', () => {
			if (!data) {
				resolve({});
				return;
			}
			try {
				resolve(JSON.parse(data));
			} catch (error) {
				reject(new HttpError(400, 'Invalid JSON payload.'));
			}
		});
		req.on('error', (error) => reject(error));
	});
}

module.exports = async (req, res) => {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		res.status(405).json({ error: 'Method Not Allowed' });
		return;
	}

	try {
		const body = await parseRequestBody(req);
		await sendContactEmail(body);
		res.status(200).json({ ok: true });
	} catch (error) {
		console.error(error);
		const status = error instanceof HttpError ? error.statusCode : 500;
		res.status(status).json({
			error:
				error instanceof HttpError
					? error.message
					: 'Unable to send email.',
		});
	}
};

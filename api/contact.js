const { parseMultipartForm } = require('../lib/formParser');
const { HttpError, sendContactEmail } = require('../lib/contactMailer');

module.exports = async (req, res) => {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		res.status(405).json({ error: 'Method Not Allowed' });
		return;
	}

	try {
		const { fields, files } = await parseMultipartForm(req);
		await sendContactEmail({ fields, files });
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

module.exports.config = {
	api: {
		bodyParser: false,
	},
};

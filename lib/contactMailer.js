const nodemailer = require('nodemailer');

class HttpError extends Error {
	constructor(statusCode, message) {
		super(message);
		this.statusCode = statusCode;
	}
}

let transporter;

function getTransporter() {
	if (transporter) {
		return transporter;
	}

	const user = process.env.GMAIL_USER;
	const pass = process.env.GMAIL_PASS;

	if (!user || !pass) {
		throw new HttpError(
			500,
			'Mail service is not configured. Please set GMAIL_USER and GMAIL_PASS.'
		);
	}

	transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: { user, pass },
	});

	return transporter;
}

function buildPayload(body = {}) {
	const payload = {
		name: body.name && String(body.name).trim(),
		email: body.email && String(body.email).trim(),
		phone: body.phone && String(body.phone).trim(),
		subject: body.subject && String(body.subject).trim(),
		message: body.message && String(body.message).trim(),
	};

	if (!payload.name || !payload.email || !payload.subject || !payload.message) {
		throw new HttpError(400, 'Missing required fields.');
	}

	return payload;
}

async function sendContactEmail(body) {
	const payload = buildPayload(body);

	const mailOptions = {
		from: `"${payload.name}" <${process.env.GMAIL_USER}>`,
		replyTo: payload.email,
		to: process.env.CONTACT_TO || process.env.GMAIL_USER,
		subject: `[Website] ${payload.subject}`,
		text: `Name: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone || 'N/A'}

${payload.message}`,
	};

	const mailer = getTransporter();
	await mailer.sendMail(mailOptions);
}

module.exports = {
	HttpError,
	sendContactEmail,
};

const nodemailer = require('nodemailer');
const { normalizeFieldValue, pickFileArray } = require('./formParser');

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

function getField(fields, key) {
	const raw = normalizeFieldValue(fields[key]);
	return raw ? String(raw).trim() : '';
}

function escHtml(value) {
	return String(value || '').replace(/[&<>"']/g, (ch) =>
		({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;',
		}[ch])
	);
}

function buildTableRow(label, value) {
	if (!value) {
		return '';
	}

	return `<tr>
		<td style="background:#f7f9fb;width:35%;font-weight:600;border:1px solid #e8edf3;padding:10px;">${escHtml(
			label
		)}</td>
		<td style="border:1px solid #e8edf3;padding:10px;">${escHtml(value)}</td>
	</tr>`;
}

function buildHtmlBody(fields) {
	const rows = [
		buildTableRow('Name', getField(fields, 'name')),
		buildTableRow('Email', getField(fields, 'email')),
		buildTableRow('Phone', getField(fields, 'phone')),
		buildTableRow('Subject', getField(fields, 'subject')),
		buildTableRow('Message', getField(fields, 'message')),
	].join('');

	return `<html><body>
	<table rules="all" style="border:1px solid #666;border-collapse:collapse;width:100%;max-width:640px;" cellpadding="0" cellspacing="0">
		${rows}
	</table>
</body></html>`;
}

function buildTextBody(fields) {
	return `Name: ${getField(fields, 'name')}
Email: ${getField(fields, 'email')}
Phone: ${getField(fields, 'phone')}
Subject: ${getField(fields, 'subject')}

${getField(fields, 'message')}`;
}

function buildAttachments(files) {
	return pickFileArray(files).map((file) => ({
		filename: file.originalFilename || file.newFilename || 'attachment',
		path: file.filepath,
		contentType: file.mimetype || 'application/octet-stream',
	}));
}

async function sendContactEmail({ fields = {}, files = {} }) {
	const name = getField(fields, 'name');
	const email = getField(fields, 'email');
	const subject = getField(fields, 'subject');
	const message = getField(fields, 'message');
	const honeypot = getField(fields, 'company'); // spam trap

	if (honeypot) {
		// Pretend everything worked for bots, but don't send anything.
		return;
	}

	if (!name || !email || !subject || !message) {
		throw new HttpError(400, 'Missing required fields.');
	}

	const mailOptions = {
		from: `"${name}" <${process.env.GMAIL_USER}>`,
		replyTo: email,
		to: process.env.CONTACT_TO || process.env.GMAIL_USER,
		subject: `[Website] ${subject}`,
		html: buildHtmlBody(fields),
		text: buildTextBody(fields),
		attachments: buildAttachments(files),
	};

	const mailer = getTransporter();
	await mailer.sendMail(mailOptions);
}

module.exports = {
	HttpError,
	sendContactEmail,
};

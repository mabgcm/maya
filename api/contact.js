const nodemailer = require('nodemailer');
const formidable = require('formidable');

module.exports.config = {
	api: {
		bodyParser: false,
	},
};

function parseForm(req) {
	const form = formidable({ multiples: true, keepExtensions: true });

	return new Promise((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) {
				reject(err);
				return;
			}
			resolve({ fields, files });
		});
	});
}

function pickFileArray(filesObj) {
	if (!filesObj || typeof filesObj !== 'object') {
		return [];
	}

	const possibleKeys = [
		'files',
		'files[]',
		'file',
		'upload',
		'attachment',
		'attachments',
	];

	const keys = Object.keys(filesObj);
	const key = keys.find((k) => possibleKeys.includes(k)) || keys[0];
	const raw = key ? filesObj[key] : undefined;

	if (!raw) {
		return [];
	}

	return Array.isArray(raw) ? raw : [raw];
}

function esc(value) {
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

const cell = (label, value) =>
	value
		? `<tr><td style="background:#f7f9fb;width:40%;font-weight:600;border:1px solid #e8edf3;">${label}</td><td style="border:1px solid #e8edf3;">${value}</td></tr>`
		: '';

module.exports = async function handler(req, res) {
	if (req.method !== 'POST') {
		res.status(405).json({ ok: false, error: 'Method not allowed' });
		return;
	}

	try {
		const { fields, files } = await parseForm(req);

		const get = (key) => (fields[key] ?? '').toString().trim();
		const name = get('name');
		const email = get('email');
		const phone = get('phone');
		const subject = get('subject');
		const message = get('message');
		const honeypot = get('company');

		if (honeypot) {
			res.status(200).json({ ok: true, message: 'Sent' });
			return;
		}

		if (!name || !email || !subject || !message) {
			res.status(400).json({
				ok: false,
				error: 'Name, Email, Subject, and Message are required.',
			});
			return;
		}

		const rows = [
			cell('Name', esc(name)),
			cell('Email', esc(email)),
			cell('Phone', esc(phone || '')),
			cell('Subject', esc(subject)),
			cell('Message', esc(message)),
		].join('');

		const html = `<html><body>
			<table rules="all" style="border:1px solid #666;border-collapse:collapse;width:100%;max-width:640px" cellpadding="10">
				${rows}
			</table>
		</body></html>`;

		const attachments = pickFileArray(files).map((file) => ({
			filename: file.originalFilename || file.newFilename || 'attachment',
			path: file.filepath,
			contentType: file.mimetype || 'application/octet-stream',
		}));

		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		await transporter.sendMail({
			from: `"Maya Artisan Bakery" <${process.env.SMTP_USER}>`,
			to: process.env.RECIPIENT || process.env.SMTP_USER,
			replyTo: `${name} <${email}>`,
			subject: `New Website Message — ${subject} — ${name}`,
			html,
			attachments,
		});

		res.status(200).json({ ok: true, message: 'Sent' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ ok: false, error: 'Server error' });
	}
};

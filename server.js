require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_PASS,
	},
});

app.post('/api/contact', async (req, res) => {
	const { name, email, phone, subject, message } = req.body || {};

	if (!name || !email || !subject || !message) {
		return res.status(400).json({ error: 'Missing required fields.' });
	}

	const mailOptions = {
		from: `"${name}" <${process.env.GMAIL_USER}>`,
		replyTo: email,
		to: process.env.CONTACT_TO || process.env.GMAIL_USER,
		subject: `[Website] ${subject}`,
		text: `Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}

${message}`,
	};

	try {
		await transporter.sendMail(mailOptions);
		res.json({ ok: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Unable to send email.' });
	}
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`Contact API listening on ${port}`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { HttpError, sendContactEmail } = require('./lib/contactMailer');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
	try {
		await sendContactEmail(req.body);
		res.json({ ok: true });
	} catch (error) {
		console.error(error);
		if (error instanceof HttpError) {
			res.status(error.statusCode).json({ error: error.message });
			return;
		}
		res.status(500).json({ error: 'Unable to send email.' });
	}
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`Contact API listening on ${port}`);
});

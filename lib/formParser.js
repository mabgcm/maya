const formidable = require('formidable');

function parseMultipartForm(req) {
	const form = formidable({
		multiples: true,
		keepExtensions: true,
	});

	return new Promise((resolve, reject) => {
		form.parse(req, (error, fields, files) => {
			if (error) {
				reject(error);
				return;
			}
			resolve({ fields, files });
		});
	});
}

function normalizeFieldValue(value) {
	if (Array.isArray(value)) {
		return value[0];
	}

	return value;
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
	const preferredKey = keys.find((key) => possibleKeys.includes(key)) || keys[0];

	const raw = preferredKey ? filesObj[preferredKey] : undefined;

	if (!raw) {
		return [];
	}

	return Array.isArray(raw) ? raw : [raw];
}

module.exports = {
	parseMultipartForm,
	normalizeFieldValue,
	pickFileArray,
};

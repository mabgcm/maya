document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('contact-form');
	if (!form) {
		return;
	}

	const endpoint =
		(window.ENV && window.ENV.CONTACT_ENDPOINT) ||
		'http://localhost:4000/api/contact';

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
			return;
		}

		const formData = new FormData(form);
		const payload = Object.fromEntries(formData.entries());

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error('Request failed');
			}

			alert('Thanks! Your message has been sent.');
			form.reset();
		} catch (error) {
			console.error(error);
			alert('Sorry, something went wrong. Please try again later.');
		}
	});
});

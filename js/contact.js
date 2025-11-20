document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('contact-form');
	const statusEl = document.getElementById('contact-status');

	if (!form) {
		return;
	}

	const endpoint =
		(window.ENV && window.ENV.CONTACT_ENDPOINT) ||
		form.getAttribute('action') ||
		'/api/contact';

	function setStatus(message, isError = false) {
		if (!statusEl) {
			if (message) {
				alert(message);
			}
			return;
		}

		statusEl.textContent = message || '';
		statusEl.style.color = isError ? '#c0392b' : '#1e8449';
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
			return;
		}

		const formData = new FormData(form);

		if ((formData.get('company') || '').trim() !== '') {
			form.reset();
			setStatus('Thanks! Your message has been sent.');
			return;
		}

		setStatus('Sending...');

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				body: formData,
			});

			const data = await response.json().catch(() => ({}));

			if (!response.ok || data.ok !== true) {
				throw new Error(data.error || 'Unable to send your message.');
			}

			setStatus('Thanks! Your message has been sent.');
			form.reset();
		} catch (error) {
			console.error(error);
			setStatus('Sorry, something went wrong. Please try again later.', true);
		}
	});
});

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('contact-form');
	const statusBox = document.getElementById('contact-status');

	if (!form) {
		return;
	}

	function setStatus(message, type = 'info') {
		if (!statusBox) {
			if (message) {
				alert(message);
			}
			return;
		}

		statusBox.textContent = message || '';
		statusBox.style.color = type === 'error' ? '#c0392b' : '#1e8449';
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
			return;
		}

		const data = new FormData(form);

		if ((data.get('company') || '').trim() !== '') {
			setStatus('Thanks! Your message has been sent.');
			form.reset();
			return;
		}

		setStatus('Sending...');

		try {
			const response = await fetch(form.getAttribute('action') || '/api/contact', {
				method: 'POST',
				body: data,
			});
			const payload = await response.json().catch(() => ({}));

			if (!response.ok || !payload.ok) {
				throw new Error(payload.error || 'Unable to send email.');
			}

			setStatus('Thanks! Your message has been sent.');
			form.reset();
		} catch (error) {
			console.error(error);
			setStatus('Sorry, something went wrong. Please try again later.', 'error');
		}
	});
});

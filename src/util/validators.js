const validateRegisterInput = (username, email, password, confirmPassword) => {
	const errors = {};
	// TODO: username 비였을 때
	if (username.trim() === '') {
		errors.username = 'Username must not be empty';
	}
	// TODO: email 비였을 때
	if (email.trim() === '') {
		errors.email = 'Email must not be empty';
	} else {
		// TODO: email 형식
		const regEx = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
		// TODO: email이 형식에 맞지 않을 때
		if (!email.match(regEx)) {
			errors.email = 'Email must be a valid email address';
		}
	}
	// TODO: password 비였을 때
	if (password === '') {
		errors.password = 'Password must not empty';
		// TODO: password 와 confirmPassword 다를 때
	} else if (password !== confirmPassword) {
		errors.confirmPassword = 'Passwords must match';
	}

	// TODO: confirmPassword 비였을 때
	if (confirmPassword === '') {
		errors.confirmPassword = 'confirmPassword must not empty';
	}

	return {
		errors,
		valid: Object.keys(errors).length < 1,
	};
};

const validateLoginInput = (email, password) => {
	const errors = {};
	// TODO: email 비였을 때
	if (email.trim() === '') {
		errors.email = 'email must not be empty';
	}
	// TODO: password 비였을 때
	if (password.trim() === '') {
		errors.password = 'Password must not be empty';
	}

	return {
		errors,
		valid: Object.keys(errors).length < 1,
	};
};

export { validateRegisterInput, validateLoginInput };

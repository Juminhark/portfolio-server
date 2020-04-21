export const validateRegisterInput = (username, email, pw, confirmPw) => {
  const errors = {};

  if (username.trim() === '') {
    errors.username = 'username must not be empty!';
  }

  if (email.trim() === '') {
    errors.email = 'email must not be empty!';
  } else {
    const regEx = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    if (!email.match(regEx)) {
      errors.email = 'email must be a valid email address';
    }
  }

  if (pw === '') {
    errors.pw = 'password must not empty';
  } else if (pw !== confirmPw) {
    errors.confirmPw = 'password must match';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

export const validateLoginInput = (username, pw) => {
  const errors = {};
  if (username.trim() === '') {
    errors.username = 'username must not be empty';
  }
  if (pw.trim() === '') {
    errors.pw = 'password must not be empty';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

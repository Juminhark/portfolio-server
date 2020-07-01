import { AuthenticationError } from 'apollo-server';

import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const checkAuth = (context) => {
  // context = { ... headers }
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    // Bearer ....
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError('Invalid/Expired token');
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]");
  }
  throw new Error('Authorization header must be provided');
};

const requestGithubToken = (credentials) => {
  fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(credentials),
  })
    .then((res) => {
      res.json();
    })
    .catch((error) => {
      throw new Error(JSON.stringify(error));
    });
};

const requestGithubUserAccount = (token) => {
  fetch(`https://api.github.com/user?access_token=${token}`).then(
    (res) => res.json
  );
};

const requestGithubUser = async (credentials) => {
  console.log(credentials);
  const { access_token } = await requestGithubToken(credentials);
  console.log(access_token);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
};

export default { checkAuth, requestGithubUser };

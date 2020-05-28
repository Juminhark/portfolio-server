import { AuthenticationError } from 'apollo-server';

import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

export default (context) => {
	// context = { ... headers }
	console.log(context);
	const authHeader = context.req.headers.authorization;
	if (authHeader) {
		// Bearer ....
		const token = authHeader.split('Bearer ')[1];
		if (token) {
			try {
				const user = jwt.verify(token, SECRET_KEY);
				return user;
			} catch (err) {
				throw new AuthenticationError('Invalid/Expired token');
			}
		}
		throw new Error("Authentication token must be 'Bearer [token]");
	}
	throw new Error('Authorization header must be provided');
};

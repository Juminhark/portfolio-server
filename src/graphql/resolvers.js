import bcrypt from 'bcryptjs';
import { AuthenticationError, UserInputError } from 'apollo-server';
import jwt from 'jsonwebtoken';
// model
import User from '../db/models/user.model';
import Project from '../db/models/project.model';
// util
import { validateRegisterInput, validateLoginInput } from '../util/validators';
import checkAuth from '../util/check-auth';
// dotenv
import dotenv from 'dotenv';
dotenv.config();
// fetch
import { fetch } from 'cross-fetch';
// google oauth
import { google } from 'googleapis';

// TODO: login or Register. create Token. server-resolvers 단계에서 인증관리
const generateToken = (user) => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		process.env.SECRET_KEY,
		{ expiresIn: '1h' }
	);
};

// google oauth
const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	'http://localhost:3000/google/callback'
);

const resolvers = {
	Query: {
		allUser: async () => {
			try {
				const users = await User.find();
				return users;
			} catch (err) {
				throw new Error(err);
			}
		},
		getProjects: async () => {
			try {
				// sort() => Project list 순서 교정
				const projects = await Project.find().sort({ createdAt: -1 });
				return projects;
			} catch (err) {
				throw new Error(err);
			}
		},
		getProject: async (_, { projectId }) => {
			try {
				const project = await Project.findById(projectId);
				if (project) {
					return project;
				} else {
					throw new Error('Project not found');
				}
			} catch (err) {
				throw new Error(err);
			}
		},

		oauthLoginUrl: () => {
			const scopes = [
				'https://www.googleapis.com/auth/userinfo.profile',
				'https://www.googleapis.com/auth/userinfo.email',
			];

			const googleUrl = oauth2Client.generateAuthUrl({
				access_type: 'offline',
				scope: scopes,
			});

			const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user&redirect_uri=http%3A//localhost:3000/github/callback`;

			return [googleUrl, githubUrl];
		},
	},
	Mutation: {
		register: async (
			_,
			{ registerInput: { username, email, password, confirmPassword } }
		) => {
			// TODO: Validate user data
			const { valid, errors } = validateRegisterInput(
				username,
				email,
				password,
				confirmPassword
			);
			if (!valid) {
				throw new UserInputError('Errors', { errors });
			}

			// TODO: Make sure user doesn`t already exist. 동명이인이 있을수있으니 email로 체크
			const user = await User.findOne({ email });
			if (user) {
				throw new UserInputError('email is taken', {
					errors: {
						email: 'This email is taken',
					},
				});
			}

			// TODO: Hash password
			password = await bcrypt.hash(password, 12);

			const newUser = new User({
				email,
				password,
				username,
			});

			// TODO: Save the user
			const res = await newUser.save();

			// TODO: Create login token
			const token = generateToken(res);

			// TODO: 새로운 user의 정보반환. res(email, password, username), id, token
			return {
				...res._doc,
				id: res._id,
				token,
			};
		},

		login: async (_, { email, password }) => {
			const { errors, valid } = validateLoginInput(email, password);

			if (!valid) {
				throw new UserInputError('Errors', { errors });
			}

			const user = await User.findOne({ email });

			if (!user) {
				throw new UserInputError('User not found', {
					errors: {
						email: 'User not found',
					},
				});
			}

			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				throw new UserInputError('Wrong credentials', {
					errors: {
						password: 'Wrong credentials',
					},
				});
			}

			const token = generateToken(user);

			return {
				...user._doc,
				id: user._id,
				token,
			};
		},

		authorizeWithGithub: async (_, { code }) => {
			const tokenRes = await fetch(
				'https://github.com/login/oauth/access_token',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					body: JSON.stringify({
						client_id: process.env.GITHUB_CLIENT_ID,
						client_secret: process.env.GITHUB_CLIENT_SECRET,
						code,
					}),
				}
			);

			const tokenData = await tokenRes.json();

			const userRes = await fetch(
				`https://api.github.com/user?access_token=${tokenData.access_token}`
			);

			const userData = await userRes.json();

			console.log(userData);

			const currentUser = {
				username: userData.name,
				email: userData.email,
				picture_url: userData.avatar_url,
				github_url: userData.html_url,
			};

			// todo: Oauth로 접속한 user가 회원가입하지 않은 사람이라면?
			// todo: 자동으로 회원가입을 하고
			// todo: 이미 가입한 회원이라면 회원 정보를 가져다 준다.

			const user = await User.findOne({ email: currentUser.email });

			if (user) {
				const token = generateToken(user);
				console.log(user._doc);
				return {
					...user._doc,
					id: user._id,
					picture: currentUser.picture,
					token,
				};
			} else {
				const newUser = new User({
					email: currentUser.email,
					username: currentUser.username,
					picture: currentUser.picture,
				});

				// TODO: Save the user
				const res = await newUser.save();

				const token = generateToken(res);

				// TODO: 새로운 user의 정보반환. res(email, password, username), id, token
				return {
					...res._doc,
					id: res._id,
					token,
				};
			}
		},

		authorizeWithGoogle: async (_, { code }) => {
			// todo : access_token, refresh_token, scope, token_type, expiry_date
			const { tokens } = await oauth2Client.getToken(decodeURIComponent(code));

			// oauth2Client.setCredentials(tokens);

			// todo : user 정보 가져오기
			const userRes = await fetch(
				`https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${tokens.access_token}`
			);

			const userData = await userRes.json();

			const currentUser = {
				username: userData.name,
				email: userData.email,
				picture_url: userData.picture,
			};

			// todo: Oauth로 접속한 user가 회원가입하지 않은 사람이라면?
			// todo: 자동으로 회원가입을 하고
			// todo: 이미 가입한 회원이라면 회원 정보를 가져다 준다.

			const user = await User.findOne({ email: currentUser.email });

			if (user) {
				const token = generateToken(user);
				console.log(user._doc);
				return {
					...user._doc,
					id: user._id,
					picture_url: currentUser.picture_url,
					token,
				};
			} else {
				const newUser = new User({
					email: currentUser.email,
					username: currentUser.username,
					picture_url: currentUser.picture_url,
				});

				// TODO: Save the user
				const res = await newUser.save();
				const token = generateToken(res);

				// TODO: 새로운 user의 정보반환. res(email, password, username), id, token
				return {
					...res._doc,
					id: res._id,
					token,
				};
			}
		},

		createProject: async (_, { title, content }, context) => {
			const user = checkAuth(context);

			console.log(user);

			if (title.trim() === '') {
				throw new Error('Project title must not be empty');
			}
			if (content.trim() === '') {
				throw new Error('Project content must not be empty');
			}

			const newProject = new Project({
				title,
				content,
				owner: user,
				updated: new Date().toISOString(),
			});

			const project = await newProject.save();

			// context.pubsub.publish('NEW_Project', {
			// 	newProject: project,
			// });

			return project;
		},

		deleteProject: async (_, { projectId }, context) => {
			const user = checkAuth(context);

			try {
				const project = await Project.findById(projectId);
				if (project.owner === user) {
					await project.delete();
					return 'Project deleted successfully';
				} else {
					throw new AuthenticationError('Action not allowed');
				}
			} catch (err) {
				throw new Error(err);
			}
		},
	},
	Subscription: {
		newProject: {
			subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_PROJECT'),
		},
	},
};

export default resolvers;

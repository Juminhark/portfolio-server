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

// TODO : login or Register. create Token. server-resolvers 단계에서 인증관리
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
	},
	Mutation: {
		register: async (
			_,
			{ registerInput: { username, email, password, confirmPassword } }
		) => {
			// TODO : Validate user data
			const { valid, errors } = validateRegisterInput(
				username,
				email,
				password,
				confirmPassword
			);
			if (!valid) {
				throw new UserInputError('Errors', { errors });
			}

			// TODO : Make sure user doesn`t already exist. 동명이인이 있을수있으니 email로 체크
			const user = await User.findOne({ email });
			if (user) {
				throw new UserInputError('email is taken', {
					errors: {
						email: 'This email is taken',
					},
				});
			}

			// TODO : Hash password
			password = await bcrypt.hash(password, 12);

			const newUser = new User({
				email,
				password,
				username,
			});

			// TODO : Save the user
			const res = await newUser.save();

			// TODO : Create login token
			const token = generateToken(res);

			// TODO : 새로운 user의 정보반환. res(email, password, username), id, token
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
				errors.general = 'User not found';
				throw new UserInputError('User not found', { errors });
			}

			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				errors.general = 'Wrong credentials';
				throw new UserInputError('Wrong credentials', { errors });
			}

			const token = generateToken(user);

			return {
				...user._doc,
				id: user._id,
				token,
			};
		},
		async createProject(_, { title, content }, context) {
			const user = checkAuth(context);

			if (title.trim() === '') {
				throw new Error('Project title must not be empty');
			}
			if (content.trim() === '') {
				throw new Error('Project content must not be empty');
			}

			const newProject = new Project({
				title,
				content,
				user: user.id,
				username: user.username,
				updated: new Date().toISOString(),
			});

			const project = await newProject.save();

			context.pubsub.publish('NEW_Project', {
				newProject: project,
			});

			return project;
		},
		async deleteProject(_, { projectId }, context) {
			const user = checkAuth(context);

			try {
				const project = await Project.findById(projectId);
				if (user.username === project.username) {
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

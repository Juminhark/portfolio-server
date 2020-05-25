import bcrypt from 'bcryptjs';
import { UserInputError } from 'apollo-server';
import jwt from 'jsonwebtoken';
import User from '../db/models/user.model';
import { validateRegisterInput } from '../util/validators';
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

      // TODO : Make sure user doesnt already exist. 동명이인이 있을수있으니 email로 체크
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
        errors.general = 'Wrong crendetials';
        throw new UserInputError('Wrong crendetials', { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
  },
};

export default resolvers;

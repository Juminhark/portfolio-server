import bcrypt from 'bcryptjs';
import { UserInputError } from 'apollo-server';
import jwt from 'jsonwebtoken';
import User from '../db/models/user.model';
import { validateRegisterInput } from '../util/validators';
// dotenv
import dotenv from 'dotenv';
dotenv.config();

// TODO : login or Register. create Token
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
    createUser: async (
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

      // TODO : Make sure user doesnt already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken',
          },
        });
      }

      // TODO : Hash password
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        password,
        username,
        createdAt: new Date().toISOString(),
      });

      // TODO : Save the user
      const res = await newUser.save();

      console.log(res);

      // TODO : Create login token
      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};

export default resolvers;

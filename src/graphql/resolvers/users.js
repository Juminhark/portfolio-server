import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validateRegisterInput } from '../../utils/validators';
import { UserInputError } from 'apollo-server-core';
import dotenv from 'dotenv';
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
};

export default {
  Query: {
    allUser: async (parent, args, { models }) => {
      const Users = await models.User.find({});
      return Users;
    },
    getUser: async (parent, { email }, { models }) => {
      const User = await models.User.findOne({ email });
      return User;
    },
  },

  Mutation: {
    createUser: async (
      parent,
      { registerInput: { username, email, pw, confirmPw } },
      { models }
    ) => {
      // user data 검증
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        pw,
        confirmPw
      );
      if (!valid) {
        throw new UserInputError('errors', { errors });
      }
      // user 존재 여부 확인
      const checkUser = await models.User.findOne({ email });
      if (checkUser) {
        throw new UserInputError('email is taken', {
          errors: {
            email: 'This email is taken',
          },
        });
      }
      // hash password
      pw = await bcrypt.hash(pw, 12);

      // create a new User
      const newUser = new models.User({
        email,
        pw,
        username,
      });

      // save the User
      const res = await newUser.save();

      // 토큰 생성
      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },

    deleteUser: async (parent, { email }, { models }) => {
      // User 확인
      const checkUser = await models.User.findOne({ email });

      if (!checkUser) {
        throw new Error('존재하지 않는 User입니다.');
      }

      try {
        await models.User.findOneAndDelete({ email });
      } catch (e) {
        throw new Error('cannot delete User');
      }

      // token 없애야한다.

      return true;
    },

    // updateUser: async (_, { Email, pw, name }, { models }) => {
    //   // User 확인
    //   const checkUser = await models.User.findOne({ Email });

    //   if (!checkUser) {
    //     throw new Error('존재하지 않는 User입니다.');
    //   }

    //   try {
    //     await models.User.findOneAndUpdate(
    //       { Email },
    //       { pw, name },
    //       {
    //         new: true,
    //       }
    //     );
    //   } catch (e) {
    //     throw new Error('cannot update User');
    //   }

    //   // User 확인
    //   const updatedUser = await models.User.findOne({ Email });

    //   return updatedUser;
    // },
  },
};

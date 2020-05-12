import bcrypt from 'bcryptjs';
import User from '../db/models/user.model';

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
      const newUser = new User({
        email,
        pw,
        username,
        createdAt: new Date().toISOString(),
      });

      // save the User
      const res = await newUser.save();

      return {
        ...res._doc,
        id: res._id,
      };
    },
  },
};

export default resolvers;

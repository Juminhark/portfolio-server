// import { EmailAddressResolver } from 'graphql-scalars';

export default {
  // EmailAddress: EmailAddressResolver,

  Query: {
    allUser: async (parent, args, { models }) => {
      const Users = await models.User.find({});
      return Users; 
    },
    getUser: async(parent, { Email },  { models }) => {
      const User = await models.User.findOne({Email});
      return User;
    }
  },

  Mutation: {
    createUser: async (parent, { Email, pw, name }, { models } ) => {
      // User 확인
      const checkUser = await models.User.findOne({Email});     

      if(checkUser) {
        throw new Error('이미 존재하는 email 입니다.')
      }
      
      // create a new User
      const newUser = new models.User({
        Email,
        pw,
        name
      });

      // save the User
      try {
        await newUser.save();
      } catch(e) {
        throw new Error('Cannot Save User!!!');
      }

      return true;
    },
    deleteUser: async (parent, { Email }, { models }) => {
      // User 확인
      const checkUser = await models.User.findOne({Email});     

      if(!checkUser) {
        throw new Error('존재하지 않는 User입니다.')
      }

      try {
        await models.User.findOneAndDelete({Email})
      } catch(e) {
        throw new Error('cannot delete User')
      }
      return true
    },
    updateUser: async (parent, { Email, pw, name }, { models }) => {
      // User 확인
      const checkUser = await models.User.findOne({Email});     

      if(!checkUser) {
        throw new Error('존재하지 않는 User입니다.')
      }
    
      try {
        await models.User.findOneAndUpdate({Email}, { pw, name }, {
          new: true
        })
      } catch(e) {
        throw new Error('cannot update User')
      }

      // User 확인
      const updatedUser = await models.User.findOne({Email});     

      return updatedUser
    },
  },
};
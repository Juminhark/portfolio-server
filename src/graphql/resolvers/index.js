import userResolvers from './users';

export default {
  Query: {
    ...userResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
  },
};

//graphql-scalars
// import { EmailAddressResolver } from 'graphql-scalars';
// EmailAddress: EmailAddressResolver

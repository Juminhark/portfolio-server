import { gql } from 'apollo-server';

const typeDefs = gql`
  type Query {
    allUser: [User!]!
  }

  type Mutation {
    createUser(registerInput: RegisterInput): User!
  }

  # Schema Types
  type User {
    id: ID!
    email: String!
    pw: String!
    username: String!
  }

  # Input
  input RegisterInput {
    email: String!
    pw: String!
    confirmPw: String!
    username: String!
  }
`;

export default typeDefs;

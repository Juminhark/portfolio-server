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
    password: String!
    username: String!
  }

  # Input
  input RegisterInput {
    email: String!
    password: String!
    confirmPassword: String!
    username: String!
  }
`;

export default typeDefs;

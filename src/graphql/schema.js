import { gql } from 'apollo-server';

const typeDefs = gql`
  type Query {
    allUser: [User!]!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(email: String!, password: String!): User!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    token: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }
`;

export default typeDefs;

import { gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    username: String!
    token: String!
    avatar: String
    githubLogin: String
  }

  type Project {
    id: ID!
    title: String!
    content: String!
    updated: String!
    username: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  type AuthPayload {
    githubToken: String!
    user: User!
  }

  type Query {
    allUser: [User]
    getProjects: [Project]
    getProject(projectId: ID!): Project
    githubLoginUrl: String!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(email: String!, password: String!): User!
    authorizeWithGithub(code: String!): AuthPayload!
    createProject(title: String!, content: String): Project!
    deleteProject(projectId: ID!): String
  }

  type Subscription {
    newProject: Project!
  }
`;

export default typeDefs;

// user: User!

// authorizeWithGoogle(code: String): AuthPayload

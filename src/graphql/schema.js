import { gql } from 'apollo-server';

const typeDefs = gql`
	type User {
		id: ID!
		email: String!
		username: String!
		token: String!
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

	type Query {
		allUser: [User]
		getProjects: [Project]
		getProject(projectId: ID!): Project
	}

	type Mutation {
		register(registerInput: RegisterInput): User!
		login(email: String!, password: String!): User!
		createProject(title: String!, content: String): Project!
		deleteProject(projectId: ID!): String
	}

	type Subscription {
		newProject: Project!
	}
`;

export default typeDefs;

// apollo-server
import { ApolloServer } from 'apollo-server';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
// mongoose
import { startDB } from './db';
// dotenv
import dotenv from 'dotenv';
dotenv.config();

// DB Connect //
const db = startDB({
  connectURL: process.env.DB_URL,
});

const server = new ApolloServer({ typeDefs, resolvers, db });

// The `listen` method launches a web server.
server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

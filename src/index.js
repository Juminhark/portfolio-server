// apollo-server
import { ApolloServer, PubSub } from 'apollo-server';
import typeDefs from './graphql/typeDefs';
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

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub, db }),
});

// The `listen` method launches a web server.
server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

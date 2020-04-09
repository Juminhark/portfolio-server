import { GraphQLServer } from 'graphql-yoga'
import { startDB, models } from './db';
import resolvers from './graphql/resolvers';
import dotenv from 'dotenv';
dotenv.config();

// DB Connect //
const db = startDB({
  connectURL: process.env.ATLAS_URI
})

const context = {
  models,
  db,
}

const server = new GraphQLServer({ 
  typeDefs: `${__dirname}/graphql/schema.graphql`, 
  resolvers,
  context,
});

// options //
const options = {
  port: process.env.PORT
}

server.start(options, ({ port }) =>
  console.log(
    `Server started, http://localhost:${port}`,
  ),
)



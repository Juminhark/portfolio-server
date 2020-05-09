// apollo-server
import { ApolloServer } from 'apollo-server';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
// mongoose
import { startDB } from './db';

// DB Connect //
const db = startDB({
  connectURL:
    'mongodb+srv://admin:admin@cluster0-czmgd.gcp.mongodb.net/test?retryWrites=true&w=majority',
});

const server = new ApolloServer({ typeDefs, resolvers, db });

// The `listen` method launches a web server.
server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

# portfolio-note-server

## 1.0.0 : server - client 생성과 연결에 중점.

- [`Apollo-Server`](https://www.apollographql.com/docs/apollo-server/getting-started/)

- [babel-cli](https://jaeyeophan.github.io/2017/05/16/Everything-about-babel/)

- [mongoose](https://mongoosejs.com/docs/)

## Step 1 : Init and Install dependencies

```sh
yarn init -y

yarn add apollo-server graphql
```

## nodemon and babel-cli

```sh
yarn add nodemon babel-cli babel-preset-env babel-preset-stage-3 --dev
```

```ts
// .babelrc
{
 "presets": ["env", "stage-3"]
}

// package.json
{
 ...
 "scripts": {
   "start": "nodemon --exec babel-node src/index.js"
 }
 ...
}
```

## mongoose

```sh
yarn add mongoose
```

```ts
// db/index.js
import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

export const startDB = ({ connectURL }) =>
  mongoose.connect(`${connectURL}`, {
    useNewUrlParser: true,
  });

const connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));

connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// index.js
import { startDB } from './db';

const db = startDB({
  connectURL: [mongoDB - cluster - url],
});

const server = new ApolloServer({ typeDefs, resolvers, db });
```

## Step 2 : Define your Graphql schema

- graphql schema

```ts
// graphql/schema.js
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
```

## Step 3 : Define your data set

```ts
// db/models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    pw: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);
```

## Step 4 : Define a resolver

```ts
// graphql/resolvers.js
import User from '../db/models/user.model';

const resolvers = {
  Query: {
    allUser: async () => {
      try {
        const users = await User.find();
        return users;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createUser: async (
      _,
      { registerInput: { username, email, pw, confirmPw } }
    ) => {
      const newUser = new User({
        email,
        pw,
        username,
      });

      // save the User
      const res = await newUser.save();

      return {
        ...res._doc,
        id: res._id,
      };
    },
  },
};

export default resolvers;
```

```sh

yarn add graphql-yoga mongoose dotenv jsonwebtoken bcryptjs
```

## dotenv

## password

## vaild

## reference

- [`heroku - dotenv`](https://velog.io/@suseodd/Heroku%EC%97%90-.env%ED%8C%8C%EC%9D%BC-%EC%A0%81%EC%9A%A9-20k621f03d)

## [graphql-manager](https://engine.apollographql.com/org)

```sh
npx apollo service:push --graph=Juminhark-7612 --key=user:gh.Juminhark:bQVB2ZAQwxJZn0A1YQa0_Q --endpoint=http://localhost:4000
```

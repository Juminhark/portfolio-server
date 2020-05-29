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
import { UserInputError } from 'apollo-server';

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
			// Make sure user doesnt already exist
			const user = await User.findOne({ username });
			if (user) {
				throw new UserInputError('Username is taken', {
					errors: {
						username: 'This username is taken',
					},
				});
			}

			const newUser = new User({
				email,
				pw,
				username,
			});

			// Save the User
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

## dotenv / secret key

```sh
yarn add dotenv
```

```ts
// index.js
import dotenv from 'dotenv';
dotenv.config();

const db = startDB({
  connectURL: process.env.DB_URL,
});

// .env
DB_URL=[cloud.mongodb connect url]
```

## bcrypt-password / hash password

```sh
yarn add bcryptjs
```

```ts
// graphql/resolvers.js
import bcrypt from 'bcryptjs';

password = await bcrypt.hash(password, 12);
```

## validation 검증

```ts
// util/validators.js
const validateRegisterInput = (username, email, password, confirmPassword) => {
	const errors = {};
	// username 비였을 때
	if (username.trim() === '') {
		errors.username = 'Username must not be empty';
	}
	// email 비였을 때
	if (email.trim() === '') {
		errors.email = 'Email must not be empty';
	} else {
		// email 형식
		const regEx = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
		// email이 형식에 맞지 않을 때
		if (!email.match(regEx)) {
			errors.email = 'Email must be a valid email address';
		}
	}
	// password 비였을 때
	if (password === '') {
		errors.password = 'Password must not empty';
		// password 와 confirmPassword 다를 때
	} else if (password !== confirmPassword) {
		errors.confirmPassword = 'Passwords must match';
	}

	return {
		errors,
		valid: Object.keys(errors).length < 1,
	};
};

export { validateRegisterInput };
```

```ts
// graphql/resolvers.js
import { validateRegisterInput } from '../util/validators';

...

// Validate user data
const { valid, errors } = validateRegisterInput(
  username,
  email,
  password,
  confirmPassword
);
if (!valid) {
  throw new UserInputError('Errors', { errors });
}
```

## Authorization 인가 - [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

```sh
yarn add jsonwebtoken
```

```ts
const generateToken = (user) => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		SECRET_KEY,
		{ expiresIn: '1h' }
	);
};

// Create login token
const token = generateToken(res);
```

## [GraphQL 서버의 사용자 인증/인가 (Apollo Server Authentication/Authorization)](https://www.daleseo.com/graphql-apollo-server-auth/)

server application을 개발할때 사용자 인증(Authentication)과 인가(Authorization)는 데이터 보안의 핵심적인 기능.

### HTTP 인증 방식

HTTP 인증 방법에는 여러가지가 있는데, GraphQL 스팩에서는 어떤 특별한 인증 방법을 쓰라고 별도로 가이드를 하고 있지는 않고 있습니다.

- Bearer 인증 방식

Bearer 인증 방식은 클라이언트에서 서버로 요청을 보낼 때 마다 HTTP **Authorization** 헤더를 **Bearer [token]**으로 설정합니다.
그러면 서버에서는 클라이언트에서 보낸 인증 토큰이 유효한지, 어떤 사용자의 토큰인지를 파악해서 사용자 인증 처리를 해줍니다.

### context 레벨 인증

- client 에서 인증 token이 넘어오지않거나, 넘어온 token이 유효하지 않는 경우에는 요청을 무조건 차단.
- **ApolloServer** 생성자의 **context** 옵션에 할당된 함수는 모든 요청에 대해 호출이 되고 요청 정보를 인자로 받기 때문에 인증 토큰을 검증하는 장소로 접합.

```ts
// AuthenticationError, ForbiddenError : 인증실패 / 인가 실패
import { AuthenticationError, ForbiddenError } from 'apollo-server';

const auth = ({ req }) => {
	if (!req.headers.authorization)
		throw new AuthenticationError('missing token');

	const token = req.headers.authorization.substr(7);
	const user = users.find((user) => user.token === token);
	if (!user) throw new AuthenticationError('invalid token');
	return { user };
};

const context = { db, auth };

const server = new ApolloServer({ typeDefs, resolvers, context });
```

### resolver 레벨 인증

context 레벨 인증이 보안적으로 매우 강력하기는 하지만 실제 GraphQL API가 제공하는 쿼리(query) 중 일부가 인증없이도 실행이 필요한 경우도 있어 위와 같이 일괄적으로 차단을 하면 안되는 구조적인 문제점이 있다.

예를 들면 register, login과 같이 인증 token을 부여받기 전에 app에 접근하면 다른 사용자가 만든 전체 project를 볼수있도록 구성되있기 때문에 GraphQL API로 전체 project를 쿼리로 제공 받는다.

따라서 resolver 단계에서 일부 mutation을 다룰때 사용자를 인증하도록 구성.

- context 옵션에 할당된 req에 context.req.headers.authorization 의 형태로 token을 가지고있다.

```ts
const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => ({ req, pubsub, db }),
});
```

- resolver 단계. **createProject** **mutation** 에서 사전 생성된 token을 확인.

```ts
import checkAuth from '../util/check-auth';

const resolvers = {
	Mutation: {
		async createProject(_, { title, content }, context) {
			const user = checkAuth(context);
		}
```

- context.req.headers.authorization 에서 Bearer 인증 방식으로 부여된 token을 확인.
- Bearer [token] 형식으로 되어있기 때문에 'Bearer '을 잘라낸 **[token]**을 인가시 사용된 process.env.SECRET_KEY을 이용해 verify 한다.
-

```ts
// util/check-auth
import { AuthenticationError } from 'apollo-server';

import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

export default (context) => {
	// context = { ... headers }
	const authHeader = context.req.headers.authorization;
	if (authHeader) {
		// Bearer ....
		const token = authHeader.split('Bearer ')[1];
		if (token) {
			try {
				const user = jwt.verify(token, process.env.SECRET_KEY);
				return user;
			} catch (err) {
				throw new AuthenticationError('Invalid/Expired token');
			}
		}
		throw new Error("Authentication token must be 'Bearer [token]");
	}
	throw new Error('Authorization header must be provided');
};
```

> login으로 token 받기 인가(Authorization)

![](../portfolio-server/img/login.png)

> 인증(Authentication)

![](../portfolio-server/img/login.png)

## reference

- [`heroku - dotenv`](https://velog.io/@suseodd/Heroku%EC%97%90-.env%ED%8C%8C%EC%9D%BC-%EC%A0%81%EC%9A%A9-20k621f03d)

## [graphql-manager](https://engine.apollographql.com/org)

```sh
npx apollo service:push --graph=Juminhark-7612 --key=user:gh.Juminhark:bQVB2ZAQwxJZn0A1YQa0_Q --endpoint=http://localhost:4000
```

# download

- npm install

```sh
> npm install
```

- create .env

```ts
// .env
DB_URL=[mongoDB Cluster Connection string]
SECRET_KEY=[token verify key]
```

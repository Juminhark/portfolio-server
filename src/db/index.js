import mongoose from 'mongoose';
import User from './models/user.model';

// Set up Mongoose Promises.
mongoose.Promise = global.Promise;

export const startDB = ({ connectURL }) =>
  mongoose.connect(`${connectURL}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

const connection = mongoose.connection;

connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

export const models = {
  User,
};

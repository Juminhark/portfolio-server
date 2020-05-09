import mongoose from 'mongoose';

// Set up Mongoose Promises.
mongoose.Promise = global.Promise;

export const startDB = ({ connectURL }) =>
  mongoose.connect(`${connectURL}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });

const connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));

connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

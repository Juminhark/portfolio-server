import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, index: true, unique: true },
  password: { type: String },
});

export default mongoose.model('User', userSchema);

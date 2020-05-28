import { model, Schema } from 'mongoose';

const userSchema = new Schema({
	username: { type: String },
	email: { type: String, required: true, index: true, unique: true },
	password: { type: String },
});

export default model('User', userSchema);

import { model, Schema } from 'mongoose';

const userSchema = new Schema({
	username: String,
	email: { type: String, required: true, index: true, unique: true },
	password: String,
	picture_url: String,
	social: {
		github: String,
		facebook: String,
		instagram: String,
		website: String,
	},
	projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
});

export default model('User', userSchema);

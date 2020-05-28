import { model, Schema } from 'mongoose';

const projectSchema = new Schema({
	title: { type: String },
	content: { type: String },
	updated: { type: Date, default: Date.now },
	username: String,
	user: {
		type: Schema.Types.ObjectId,
		ref: 'users',
	},
});

export default model('Project', projectSchema);

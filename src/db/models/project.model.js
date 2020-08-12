import { model, Schema } from 'mongoose';

const projectSchema = new Schema({
	title: { type: String },
	content: { type: String },
	updated: { type: Date, default: Date.now },
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
});

export default model('Project', projectSchema);

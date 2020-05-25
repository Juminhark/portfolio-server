import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String },
  content: { type: String },
  updated: { type: Date, default: Date.now },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  comments: [
    {
      body: String,
      username: String,
      date: Date,
    },
  ],
  likes: [
    {
      username: String,
      date: Date,
    },
  ],
  hidden: Boolean,
});

export default mongoose.model('Project', projectSchema);

import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    page_id: {
      type: String,
      required: true,
      unique: true,
    },
    note_id: {
      type: String,
      required: true,
    },
    page_title: {
      type: String,
      required: true,
    },
    page_content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Page', pageSchema);

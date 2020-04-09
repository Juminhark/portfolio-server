import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
    unique: true
  },
  pw: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);

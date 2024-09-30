import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Manager', 'TeamMember'], required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  avatar: String,
  cover_photo: String,
  createDate: { type: Date, default: Date.now },
  updateDate: Date,
});

const User = mongoose.model('User', userSchema);
export default User;
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email must be 254 characters or fewer.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      select: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

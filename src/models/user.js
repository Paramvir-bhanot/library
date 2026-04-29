import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === 'credentials';
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['google', 'facebook', 'credentials'],
      default: 'credentials',
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Applicant',
      default: null,
    },
    degree: {
      type: String,
      enum: ['High School', 'Bachelor', 'Master', 'PhD', 'Other'],
      default: 'Other',
    },
    subject: {
      type: String,
      trim: true,
    },
    medium: {
      type: String,
      enum: ['English', 'Hindi', 'Punjabi', 'Other'],
      default: 'English',
    },
    likedBooks: {
      type: [String],
      default: [],
    },
    savedNotes: {
      type: [String],
      default: [],
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to match/compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Prevent model recompilation in development
export default mongoose.models.User || mongoose.model('User', userSchema);
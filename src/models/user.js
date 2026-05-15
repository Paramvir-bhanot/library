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
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      default: null,
    },
    provider: {
      type: String,
      enum: ['google', 'facebook', 'github', 'credentials'],
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
    lastlogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to match/compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Prevent model recompilation in development
export const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', userSchema);

export default mongoose.models.User || mongoose.model('User', userSchema);
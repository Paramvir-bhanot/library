import mongoose from 'mongoose';

const crewMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      default: '',
    },
    schoolCollegeUniversityName: {
      type: String,
      default: '',
      trim: true,
    },
    session: {
      type: String,
      default: '',
      trim: true,
    },
    degreeOrClass: {
      type: String,
      default: '',
      trim: true,
    },
    languagesLearning: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    provider: {
      type: String,
      enum: ['google', 'facebook', 'github', 'credentials'],
      default: 'credentials',
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

crewMemberSchema.index({ applicantId: 1 }, { unique: true });
crewMemberSchema.index({ email: 1 });

const StudentProfile =
  mongoose.models.StudentProfile || mongoose.model('StudentProfile', crewMemberSchema);

export default StudentProfile;
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import connectDB from "@/src/lib/DBconnection";
import User from "@/src/models/user";
import StudentProfile from "@/src/models/crewMembers";

// PUT - Update crew member profile for authenticated user
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await req.json();

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find existing student profile
    let studentProfile = await StudentProfile.findOne({ applicantId: user._id });

    if (!studentProfile) {
      return new Response(
        JSON.stringify({ error: "Profile not found. Please create a profile first." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update profile fields
    const updateableFields = [
      "name",
      "email",
      "image",
      "gender",
      "schoolCollegeUniversityName",
      "session",
      "degreeOrClass",
      "languagesLearning",
      "images",
    ];

    updateableFields.forEach((field) => {
      if (data[field] !== undefined) {
        studentProfile[field] = data[field];
      }
    });

    const validationError = studentProfile.validateSync();
    if (validationError) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validationError.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await studentProfile.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile updated successfully",
        profile: {
          _id: studentProfile._id.toString(),
          name: studentProfile.name,
          email: studentProfile.email,
          image: studentProfile.image,
          gender: studentProfile.gender,
          schoolCollegeUniversityName: studentProfile.schoolCollegeUniversityName,
          session: studentProfile.session,
          degreeOrClass: studentProfile.degreeOrClass,
          languagesLearning: studentProfile.languagesLearning,
          images: studentProfile.images,
          applicantId: studentProfile.applicantId?.toString(),
          createdAt: studentProfile.createdAt,
          updatedAt: studentProfile.updatedAt,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return new Response(
        JSON.stringify({ error: "Validation error", details: messages }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return new Response(
        JSON.stringify({ error: `${field} already exists` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Failed to update profile", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST - Alternative update endpoint
export async function POST(req) {
  return PUT(req);
}

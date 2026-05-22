import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import connectDB from "@/src/lib/DBconnection";
import User from "@/src/models/user";
import StudentProfile from "@/src/models/crewMembers";

// POST - Add crew member profile for authenticated user
export async function POST(req) {
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

    // Check if profile already exists
    const existingProfile = await StudentProfile.findOne({ applicantId: user._id });

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: "Profile already exists. Use update endpoint instead." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create new student profile
    const newProfile = new StudentProfile({
      name: data.name || user.name,
      email: data.email || user.email,
      image: data.image || user.image,
      gender: data.gender,
      schoolCollegeUniversityName: data.schoolCollegeUniversityName,
      session: data.session,
      degreeOrClass: data.degreeOrClass,
      languagesLearning: data.languagesLearning || [],
      images: data.images || [],
      provider: user.provider,
      applicantId: user._id,
    });

    const validationError = newProfile.validateSync();
    if (validationError) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validationError.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await newProfile.save();

    // Update user with applicantId reference
    user.applicantId = newProfile._id;
    await user.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile created successfully",
        profile: {
          _id: newProfile._id.toString(),
          name: newProfile.name,
          email: newProfile.email,
          image: newProfile.image,
          gender: newProfile.gender,
          schoolCollegeUniversityName: newProfile.schoolCollegeUniversityName,
          session: newProfile.session,
          degreeOrClass: newProfile.degreeOrClass,
          languagesLearning: newProfile.languagesLearning,
          images: newProfile.images,
          applicantId: newProfile.applicantId?.toString(),
          createdAt: newProfile.createdAt,
          updatedAt: newProfile.updatedAt,
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error adding profile:", error);
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
      JSON.stringify({ error: "Failed to add profile", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

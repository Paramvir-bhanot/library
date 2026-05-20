import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import connectDB from "@/src/lib/DBconnection";
import User from "@/src/models/user";
import userProfile from "../../../../../../src/models/user";

// GET - Fetch crew member profile for authenticated user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find visitor profile
    let visitorProfile = await StudentProfile.findOne({ applicantId: user._id });

    if (!visitorProfile) {
      // If no profile exists, return empty profile with user data
      return new Response(
        JSON.stringify({
          _id: null,
          name: user.name,
          email: user.email,
          image: user.image,
          gender: "",
          schoolCollegeUniversityName: "",
          session: "",
          degreeOrClass: "",
          languagesLearning: [],
          images: [],
          applicantId: user._id.toString(),
          createdAt: null,
          updatedAt: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        _id: visitorProfile._id.toString(),
        name: visitorProfile.name,
        email: visitorProfile.email,
        image: visitorProfile.image,
        gender: visitorProfile.gender,
        schoolCollegeUniversityName: visitorProfile.schoolCollegeUniversityName,
        session: visitorProfile.session,
        degreeOrClass: visitorProfile.degreeOrClass,
        languagesLearning: visitorProfile.languagesLearning || [],
        images: visitorProfile.images || [],
        applicantId: visitorProfile.applicantId?.toString(),
        createdAt: visitorProfile.createdAt,
        updatedAt: visitorProfile.updatedAt,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    if (error.name === "ValidationError") {
      return new Response(
        JSON.stringify({ error: "Validation error", details: error.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Failed to fetch profile", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST - Create crew member profile for authenticated user
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
        JSON.stringify({ error: "Profile already exists. Use PUT to update." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create new visitor profile
    const newProfile = new StudentProfile({
      name: data.name || user.name,
      email: data.email || user.email,
      image: data.image || user.image || "",
      gender: data.gender || "",
      schoolCollegeUniversityName: data.schoolCollegeUniversityName || "",
      session: data.session || "",
      degreeOrClass: data.degreeOrClass || "",
      languagesLearning: data.languagesLearning || [],
      images: data.images || [],
      provider: data.provider || user.provider,
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
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating profile:", error);
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
      return new Response(
        JSON.stringify({ error: "Email already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Failed to create profile", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

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

    // Find existing visitor profile
    let visitorProfile = await StudentProfile.findOne({ applicantId: user._id });

    if (!visitorProfile) {
      // If profile doesn't exist, create it
      visitorProfile = new StudentProfile({
        name: data.name || user.name,
        email: data.email || user.email,
        image: data.image || user.image,
        gender: data.gender || "",
        schoolCollegeUniversityName: data.schoolCollegeUniversityName || "",
        session: data.session || "",
        degreeOrClass: data.degreeOrClass || "",
        languagesLearning: data.languagesLearning || [],
        images: data.images || [],
        provider: data.provider || user.provider,
        applicantId: user._id,
      });
    } else {
      // Update existing profile
      visitorProfile.name = data.name !== undefined ? data.name : visitorProfile.name;
      visitorProfile.email = data.email !== undefined ? data.email : visitorProfile.email;
      visitorProfile.image = data.image !== undefined ? data.image : visitorProfile.image;
      visitorProfile.gender = data.gender !== undefined ? data.gender : visitorProfile.gender;
      visitorProfile.schoolCollegeUniversityName =
        data.schoolCollegeUniversityName !== undefined ? data.schoolCollegeUniversityName : visitorProfile.schoolCollegeUniversityName;
      visitorProfile.session = data.session !== undefined ? data.session : visitorProfile.session;
      visitorProfile.degreeOrClass = data.degreeOrClass !== undefined ? data.degreeOrClass : visitorProfile.degreeOrClass;
      visitorProfile.languagesLearning = data.languagesLearning !== undefined ? data.languagesLearning : visitorProfile.languagesLearning;
      visitorProfile.images = data.images !== undefined ? data.images : visitorProfile.images;
    }

    // Validate before saving
    const validationError = visitorProfile.validateSync();
    if (validationError) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validationError.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await visitorProfile.save();

    // Ensure user has applicantId reference
    if (!user.applicantId || user.applicantId.toString() !== visitorProfile._id.toString()) {
      user.applicantId = visitorProfile._id;
      await user.save();
    }

    return new Response(
      JSON.stringify({
        _id: visitorProfile._id.toString(),
        name: visitorProfile.name,
        email: visitorProfile.email,
        image: visitorProfile.image,
        gender: visitorProfile.gender,
        schoolCollegeUniversityName: visitorProfile.schoolCollegeUniversityName,
        session: visitorProfile.session,
        degreeOrClass: visitorProfile.degreeOrClass,
        languagesLearning: visitorProfile.languagesLearning,
        images: visitorProfile.images,
        applicantId: visitorProfile.applicantId?.toString(),
        createdAt: visitorProfile.createdAt,
        updatedAt: visitorProfile.updatedAt,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return new Response(
        JSON.stringify({ error: "Validation error", details: messages }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    // Handle duplicate key errors
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

 import connectDB from "@/lib/DBconnection";
import user from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please provide all fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create an user record with basic info
    const applicant = new user({
      name,
      email,
      phoneNumber: "", // Can be updated later in profile
      gender: "Prefer not to say", // Default value
      dob: new Date(), // Default value, can be updated
      experience: "Fresher", // Default value
      previousRoles: [],
      skills: [],
      englishProficiency: "Basic",
      computerKnowledge: {
        msOffice: false,
        basicComputer: false,
        photoshop: false,
        canva: false,
        tally: false,
        other: "",
      },
    });

    await applicant.save();

    // Create User with userId reference
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      provider: "credentials",
      userId: user._id,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
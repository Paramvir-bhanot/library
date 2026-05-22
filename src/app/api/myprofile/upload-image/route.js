import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST - Upload image
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image");
    const imageType = formData.get("type") || "profile";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "Booksjunction/user",
          resource_type: "auto",
          tags: [imageType],
        },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            resolve(
              new Response(
                JSON.stringify({ error: "Failed to upload image" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
              )
            );
            return;
          }

          resolve(
            new Response(
              JSON.stringify({
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
              }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            )
          );
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload image" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

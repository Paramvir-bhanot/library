import { v2 as cloudinary } from 'cloudinary';

const resolveCloudinaryEnv = () => {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Support the common single-var format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  if ((!cloudName || !apiKey || !apiSecret) && process.env.CLOUDINARY_URL) {
    try {
      const u = new URL(process.env.CLOUDINARY_URL);
      if (u.protocol && u.protocol.startsWith('cloudinary')) {
        cloudName = cloudName || u.hostname;
        apiKey = apiKey || decodeURIComponent(u.username || '');
        apiSecret = apiSecret || decodeURIComponent(u.password || '');
      }
    } catch {
      // ignore; we'll validate elsewhere
    }
  }

  return { cloudName, apiKey, apiSecret };
};

const { cloudName, apiKey, apiSecret } = resolveCloudinaryEnv();

// Configure Cloudinary using resolved environment variables
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
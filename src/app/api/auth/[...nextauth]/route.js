// Defer all NextAuth and auth option imports to request-time so the bundler
// doesn't evaluate server-only dependencies during the build phase.
export async function GET(...args) {
  if (!process.env.NEXTAUTH_SECRET) {
    console.error("❌ NEXTAUTH_SECRET is not set in environment variables");
    throw new Error("NEXTAUTH_SECRET is required for NextAuth to work");
  }

  const NextAuth = (await import("next-auth")).default;
  const { authOptions } = await import("../../../../../src/lib/auth");
  const handler = NextAuth(authOptions);
  return handler(...args);
}

export async function POST(...args) {
  if (!process.env.NEXTAUTH_SECRET) {
    console.error("❌ NEXTAUTH_SECRET is not set in environment variables");
    throw new Error("NEXTAUTH_SECRET is required for NextAuth to work");
  }

  const NextAuth = (await import("next-auth")).default;
  const { authOptions } = await import("../../../../../src/lib/auth");
  const handler = NextAuth(authOptions);
  return handler(...args);
}
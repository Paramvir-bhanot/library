import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { getUserData, setUserData } from "../../../../src/lib/DBconnection"

export default async function handler(req, res) {
  // ✅ Get the session (contains Google ID)
  const session = await getServerSession(req, res, authOptions)

  // 🚫 Block unauthenticated requests
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: "Not authenticated" })
  }

  const googleId = session.user.id   // the unique Google ID
  const { method } = req

  switch (method) {
    // 📥 GET – return the user's data
    case "GET": {
      const data = getUserData(googleId)
      return res.status(200).json({ data })
    }

    // 📤 POST – create new data entry (if it doesn't exist)
    case "POST": {
      const body = req.body

      // Check if data already exists (optional behaviour)
      const existing = getUserData(googleId)
      if (existing) {
        return res.status(409).json({ error: "Data already exists. Use PUT to update." })
      }

      const newData = setUserData(googleId, body)
      return res.status(201).json({ data: newData })
    }

    // ✏️ PUT – update / overwrite user data
    case "PUT": {
      const body = req.body
      const updated = setUserData(googleId, body)
      return res.status(200).json({ data: updated })
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}
import connectDB from "@/lib/database"
import User from "@/models/User"

async function promoteToAdmin(userEmail: string) {
  await connectDB()
  const user = await User.findOne({ email: userEmail })
  if (!user) {
    console.error("User not found.")
    process.exit(1)
  }
  if (user.role === "admin") {
    console.log("User is already an admin.")
    process.exit(0)
  }
  user.role = "admin"
  await user.save()
  console.log("User promoted to admin.")
  process.exit(0)
}

// Usage: node scripts/promote-to-admin.js user@example.com
const email = process.argv[2]
if (!email) {
  console.error("Please provide the user's email as an argument.")
  process.exit(1)
}
promoteToAdmin(email)

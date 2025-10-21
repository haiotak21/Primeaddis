
const connectDB = require("../lib/database.js")
const User = require("../models/User.js")
const bcrypt = require("bcryptjs")

async function createSuperAdmin() {
  await connectDB()
  const email = "primeaddissuper@gmail.com"
  const password = "Superadmin_top1"
  const name = "PrimeAddis Superadmin"

  // Check if superadmin already exists
  const existing = await User.findOne({ email })
  const hashedPassword = await bcrypt.hash(password, 12)
  if (existing) {
    existing.role = "superadmin"
    existing.password = hashedPassword
    existing.isActive = true
    await existing.save()
    console.log("User promoted to superadmin and password updated.")
    return
  }

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "superadmin",
    isActive: true,
  })
  console.log("Superadmin created.")
}

createSuperAdmin().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1) })

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/primeaddis";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  isActive: Boolean,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function createSuperAdmin() {
  await mongoose.connect(MONGODB_URI);
  const email = "primeaddissuper@gmail.com";
  const password = "Superadmin_top1";
  const name = "PrimeAddis Superadmin";

  const existing = await User.findOne({ email });
  const hashedPassword = await bcrypt.hash(password, 12);
  if (existing) {
    existing.role = "superadmin";
    existing.password = hashedPassword;
    existing.isActive = true;
    await existing.save();
    console.log("User promoted to superadmin and password updated.");
    process.exit(0);
  }

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "superadmin",
    isActive: true,
  });
  console.log("Superadmin created.");
  process.exit(0);
}

createSuperAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});

const mongoose = require("mongoose");

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

async function promoteToSuperAdmin(email) {
  await mongoose.connect(MONGODB_URI);
  const user = await User.findOne({ email });
  if (!user) {
    console.error("User not found.");
    process.exit(1);
  }
  user.role = "superadmin";
  user.isActive = true;
  await user.save();
  console.log("User promoted to superadmin.");
  process.exit(0);
}

promoteToSuperAdmin("primeaddissuper@gmail.com").catch((err) => {
  console.error(err);
  process.exit(1);
});

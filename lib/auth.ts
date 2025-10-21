import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import connectDB from "./database"
import User from "@/models/User"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }
        // Normalize email to avoid case/whitespace mismatches
        const credentialsEmail = credentials.email.trim().toLowerCase()
        // 1) Superadmin env fallback (no DB needed)
        const superEmail = process.env.SUPERADMIN_EMAIL
        const superPassword = process.env.SUPERADMIN_PASSWORD
        if (
          superEmail &&
          superPassword &&
          credentialsEmail === superEmail.trim().toLowerCase() &&
          credentials.password === superPassword
        ) {
          return {
            // Use a valid 24-char hex string so Mongoose can cast safely
            id: "000000000000000000000000",
            email: superEmail,
            name: "Super Admin",
            role: "superadmin" as any,
            image: null,
          }
        }

        // 2) Try DB auth; if DB unavailable, return generic auth error (avoid crashing route)
        try {
          await connectDB()
        } catch (e) {
          // If DB is down and no superadmin bypass matched, report auth failure without throwing server error
          throw new Error("Invalid email or password")
        }

  const user = await User.findOne({ email: credentialsEmail }).select("+password")

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        if (!user.isActive) {
          throw new Error("Account is inactive")
        }

        // Update last login
        user.lastLogin = new Date()
        await user.save()

        const u: any = user
        return {
          id: u._id.toString(),
          email: u.email,
          name: u.name,
          role: u.role,
          image: u.profileImage,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Best effort: don't crash if DB is unavailable
        try {
          await connectDB()

          const email = (user.email || "").trim().toLowerCase()
          const existingUser = await User.findOne({ email })

          if (!existingUser) {
            await User.create({
              name: user.name,
              email,
              profileImage: (user as any).image,
              role: "user",
              lastLogin: new Date(),
            })
          } else {
            existingUser.lastLogin = new Date()
            await existingUser.save()
          }
        } catch (e) {
          // Log and allow sign-in to proceed without persistence
          console.warn("Google sign-in: DB unavailable, proceeding without persistence")
        }
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id
        const email = (user as any).email as string | undefined
        const uRole = (user as any).role as string | undefined
        // If we get a role from the auth flow, prefer it. Otherwise default to superadmin only if email matches env, else user.
        token.role = uRole ?? (email && process.env.SUPERADMIN_EMAIL && email.toLowerCase() === process.env.SUPERADMIN_EMAIL.toLowerCase() ? "superadmin" : "user")
      }

      // Handle session update
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        const email = session.user.email
        const tokenRole = token.role as string | undefined
        // Ensure role is always set; fall back to superadmin if email matches env, else user
        session.user.role = tokenRole ?? (email && process.env.SUPERADMIN_EMAIL && email.toLowerCase() === process.env.SUPERADMIN_EMAIL.toLowerCase() ? "superadmin" : "user")
      }

      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

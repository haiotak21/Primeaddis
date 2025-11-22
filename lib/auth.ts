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
          // Prefer a real DB user for superadmin if DB is reachable, so
          // profile changes persist across sessions and provide a stable id.
          try {
            await connectDB()
            let dbUser = await User.findOne({ email: superEmail }).select("name email role profileImage")
            if (!dbUser) {
              dbUser = await User.create({
                name: "Super Admin",
                email: superEmail,
                role: "superadmin",
                profileImage: null,
                isActive: true,
                lastLogin: new Date(),
              })
            } else {
              // Ensure role is elevated to superadmin for this email
              dbUser.lastLogin = new Date()
              if (dbUser.role !== "superadmin") {
                dbUser.role = "superadmin" as any
              }
              await dbUser.save()
            }
            const su: any = dbUser
            return {
              id: su._id.toString(),
              email: su.email,
              name: su.name || "Super Admin",
              role: su.role || ("superadmin" as any),
              image: su.profileImage || null,
            }
          } catch {
            // DB not available: fall back to ephemeral superadmin (non-persistent)
            return {
              id: "000000000000000000000000",
              email: superEmail,
              name: "Super Admin",
              role: "superadmin" as any,
              image: null,
            }
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
      try {
        // Debug: log provider and user info (no secrets)
        console.debug('[nextauth] signIn callback', {
          provider: account?.provider,
          email: user?.email,
        });
      } catch (e) {
        /* ignore logging errors */
      }

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
              role:
                process.env.SUPERADMIN_EMAIL &&
                email === process.env.SUPERADMIN_EMAIL.trim().toLowerCase()
                  ? ("superadmin" as any)
                  : ("user" as any),
              lastLogin: new Date(),
            })
          } else {
            existingUser.lastLogin = new Date()
            // Elevate role if this email is configured as superadmin
            if (
              process.env.SUPERADMIN_EMAIL &&
              email === process.env.SUPERADMIN_EMAIL.trim().toLowerCase() &&
              existingUser.role !== "superadmin"
            ) {
              (existingUser as any).role = "superadmin"
            }
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
      try {
        // Debug: log jwt callback inputs (avoid sensitive data)
        console.debug('[nextauth] jwt callback', {
          trigger,
          hasUser: !!user,
          tokenKeys: Object.keys(token || {}),
        });
      } catch (e) {
        /* ignore logging errors */
      }

      const isSuperEmail = (email?: string | null) =>
        !!(
          email &&
          process.env.SUPERADMIN_EMAIL &&
          email.trim().toLowerCase() === process.env.SUPERADMIN_EMAIL.trim().toLowerCase()
        )
      const safeImage = (val: unknown) => {
        if (typeof val !== "string") return undefined
        const v = val.trim()
        // Only allow http(s) URLs in JWT to avoid oversized cookies (e.g., data URLs)
        if (/^https?:\/\//i.test(v) && v.length < 1024) return v
        return undefined
      }
      if (user) {
        token.id = (user as any).id
        const email = (user as any).email as string | undefined
        const uRole = (user as any).role as string | undefined
        // Force superadmin for the configured email regardless of stored role; else use provided role or prior token/user default
        token.role = isSuperEmail(email) ? "superadmin" : (uRole ?? ((token as any).role ?? "user"))
        // Ensure base identity fields are present on token for session mapping
        token.name = (user as any).name ?? token.name
        token.image = safeImage((user as any).image) ?? token.image
      }

      // Handle session update: safely merge allowed fields from session.user
      if (trigger === "update" && session?.user) {
        const { name, image } = session.user as any;
        if (typeof name === "string" && name) token.name = name;
        const updatedImage = safeImage(image);
        if (updatedImage) token.image = updatedImage as any;
      }

      return token
    },
    async session({ session, token }) {
      try {
        // Debug: log session callback inputs
        console.debug('[nextauth] session callback', {
          userId: token.id,
          role: token.role,
        });
      } catch (e) {
        /* ignore logging errors */
      }

      if (session.user) {
        session.user.id = token.id as string
        const email = session.user.email
        const tokenRole = token.role as string | undefined
        // Force superadmin for configured email to avoid accidental demotion
        session.user.role =
          (email && process.env.SUPERADMIN_EMAIL && email.toLowerCase() === process.env.SUPERADMIN_EMAIL.toLowerCase())
            ? "superadmin"
            : (tokenRole ?? "user")
        // Map token identity fields back to session.user so UI reflects updates without full reload
        if (typeof token.name === "string" && token.name) {
          session.user.name = token.name
        }
        if (typeof token.image === "string" && /^https?:\/\//i.test(token.image)) {
          session.user.image = token.image
        }
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
  // Explicit cookie configuration to ensure consistent cookie attributes
  // across environments. This helps browsers persist the session cookie
  // after redirects (important for credentials flow).
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // Be explicit about JWT handling and provide a stable dev fallback secret to avoid JWE/JWS mismatches
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  // NOTE: In dev, NEXTAUTH_SECRET may be missing and NextAuth would generate a new random secret
  // on each reload, causing "Invalid Compact JWE/JWS" when decoding existing cookies.
  // We pin a deterministic dev fallback to keep tokens valid across reloads.
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "dev_fallback_nextauth_secret_change_me"
      : undefined),
}

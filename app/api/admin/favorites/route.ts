import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/database";
import User from "@/models/User";
import Property from "@/models/Property";
import Favorite from "@/models/Favorite";

// GET /api/admin/favorites
// Returns a flattened list of favorites: each row contains the user and the property they favorited.
// NOTE: Per-current data model we do not track the timestamp an individual favorite was added.
// If we need that later we should migrate User.favorites from ObjectId[] to [{ propertyId, addedAt }].
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    // Prefer dedicated Favorite collection if available
    const favCount = await Favorite.estimatedDocumentCount().catch(() => 0);
    let favorites: any[] = [];
    if (favCount > 0) {
      const favs = await Favorite.find()
        .populate({ path: "userId", model: User, select: "name email" })
        .populate({ path: "propertyId", model: Property, select: "title status featured featuredUntil price slug" })
        .lean();
      favorites = (favs as any[]).map((f) => ({
        user: { id: String(f.userId?._id || ""), name: f.userId?.name || "Unnamed", email: f.userId?.email },
        property: {
          id: String(f.propertyId?._id || ""),
          title: f.propertyId?.title,
          status: f.propertyId?.status,
          featured: !!f.propertyId?.featured && (!f.propertyId?.featuredUntil || new Date(f.propertyId?.featuredUntil) >= new Date()),
          price: f.propertyId?.price,
          slug: f.propertyId?.slug || String(f.propertyId?._id || ""),
        },
        createdAt: f.createdAt,
      }));
    } else {
      // Fallback to User.favorites array
      const users = await User.find({ favorites: { $exists: true, $ne: [] } })
        .select("name email favorites")
        .populate({ path: "favorites", model: Property, select: "title status featured featuredUntil price slug" })
        .lean();
      for (const u of users as any[]) {
        const favs = (u.favorites || []) as any[];
        for (const p of favs) {
          favorites.push({
            user: { id: String(u._id), name: u.name || "Unnamed", email: u.email },
            property: {
              id: String(p._id),
              title: p.title,
              status: p.status,
              featured: !!p.featured && (!p.featuredUntil || new Date(p.featuredUntil) >= new Date()),
              price: p.price,
              slug: p.slug || p._id.toString(),
            },
          });
        }
      }
    }

    // Aggregate counts by property for quick summary (useful for admin UI badges)
    const counts: Record<string, number> = {};
    favorites.forEach((f) => {
      counts[f.property.id] = (counts[f.property.id] || 0) + 1;
    });

    return NextResponse.json({ favorites, counts, totalFavorites: favorites.length });
  } catch (e: any) {
    console.error("Error fetching admin favorites", e);
    return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 });
  }
}

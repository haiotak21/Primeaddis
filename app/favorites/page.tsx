"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { PropertyCard } from "@/components/properties/property-card"
import { Button } from "@/components/ui/button"

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (status === "authenticated") {
      fetchFavorites()
    }
  }, [status, router])

  const fetchFavorites = async () => {
    try {
      const res = await axios.get("/api/users/favorites")
      setFavorites(res.data.favorites)
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (propertyId: string) => {
    try {
      await axios.delete(`/api/users/favorites/${propertyId}`)
      setFavorites(favorites.filter((fav: any) => fav._id !== propertyId))
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Favorite Properties</h1>
          <p className="mt-2 text-muted-foreground">Properties you've saved for later</p>
        </div>

        {favorites.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No favorites yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Start exploring properties and save your favorites</p>
              <Button className="mt-4" onClick={() => router.push("/properties")}>
                Browse Properties
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((property: any) => (
              <div key={property._id} className="relative">
                <PropertyCard property={property} />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => removeFavorite(property._id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

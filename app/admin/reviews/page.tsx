"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/utils/helpers"

export default function AdminReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (session && !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/dashboard")
    }

    if (status === "authenticated") {
      fetchReviews()
    }
  }, [status, session, router])

  const fetchReviews = async () => {
    try {
      const res = await axios.get("/api/admin/reviews")
      setReviews(res.data.reviews)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      await axios.delete(`/api/admin/reviews/${reviewId}`)
      setReviews(reviews.filter((r) => r._id !== reviewId))
    } catch (error) {
      console.error("Error deleting review:", error)
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
          <h1 className="text-3xl font-bold">Review Management</h1>
          <p className="mt-2 text-muted-foreground">Monitor and moderate property reviews</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
            <CardDescription>Total: {reviews.length} reviews</CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground">No reviews yet</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-6 last:border-0">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="font-medium">{review.userId?.name || "Unknown User"}</p>
                        <p className="text-sm text-muted-foreground">
                          Property: {review.propertyId?.title || "Deleted Property"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{review.rating} ★</Badge>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteReview(review._id)}>
                          Delete
                        </Button>
                      </div>
                    </div>

                    <p className="mb-2 text-sm">{review.comment}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

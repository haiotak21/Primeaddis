"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDate } from "@/utils/helpers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (session && !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/dashboard")
    }

    if (status === "authenticated") {
      fetchPayments()
    }
  }, [status, session, router])

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/api/admin/payments")
      setPayments(res.data.payments)
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    if (filter === "all") return true
    return payment.type === filter
  })

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const subscriptionRevenue = payments
    .filter((p) => p.type === "subscription")
    .reduce((sum, payment) => sum + payment.amount, 0)
  const promotionRevenue = payments
    .filter((p) => p.type === "promotion")
    .reduce((sum, payment) => sum + payment.amount, 0)

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
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="mt-2 text-muted-foreground">View and track all platform payments</p>
        </div>

        {/* Revenue Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">{payments.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(subscriptionRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {payments.filter((p) => p.type === "subscription").length} subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Promotion Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(promotionRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {payments.filter((p) => p.type === "promotion").length} promotions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
            <CardDescription>Complete payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
                <TabsTrigger value="promotion">Promotions</TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="mt-6">
                {filteredPayments.length === 0 ? (
                  <p className="text-center text-muted-foreground">No payments found</p>
                ) : (
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                      <div key={payment._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{payment.userId?.name || "Unknown User"}</p>
                          <p className="text-sm text-muted-foreground">{payment.userId?.email}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant={payment.type === "subscription" ? "default" : "secondary"}>
                              {payment.type}
                            </Badge>
                            {payment.type === "subscription" && (
                              <span className="text-xs text-muted-foreground capitalize">{payment.planType}</span>
                            )}
                            {payment.type === "promotion" && payment.propertyId && (
                              <span className="text-xs text-muted-foreground">
                                Property: {payment.propertyId.title}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-semibold">{formatPrice(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
                          <Badge variant={payment.status === "completed" ? "default" : "secondary"} className="mt-1">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

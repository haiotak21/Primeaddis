"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/utils/helpers"

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (status === "authenticated") {
      fetchNotifications()
    }
  }, [status, router])

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications")
      setNotifications(res.data.notifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`)
      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notifications/mark-all-read")
      fetchNotifications()
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const unreadNotifications = notifications.filter((n: any) => !n.read)

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="mt-2 text-muted-foreground">
              {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? "s" : ""}
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark All as Read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold">No notifications</h3>
                <p className="mt-2 text-sm text-muted-foreground">You're all caught up!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <Card
                key={notification._id}
                className={`cursor-pointer transition-colors ${!notification.read ? "border-primary bg-primary/5" : ""}`}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{notification.message}</CardTitle>
                      <CardDescription className="mt-1">{formatDate(notification.createdAt)}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && <Badge>New</Badge>}
                      <Badge variant="outline" className="capitalize">
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

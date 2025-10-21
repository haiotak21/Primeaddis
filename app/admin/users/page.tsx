"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [passwordInputs, setPasswordInputs] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (session && !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/dashboard");
    }

    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (session?.user.role !== "superadmin") {
      alert("Only super admins can change user roles");
      return;
    }

    try {
      const payload: any = { role: newRole };
      if (["admin", "agent"].includes(newRole)) {
        const pwd = passwordInputs[userId]?.trim();
        if (!pwd || pwd.length < 8) {
          alert("Please provide a password (min 8 chars) for admin/agent role");
          return;
        }
        payload.password = pwd;
      }
      await axios.put(`/api/admin/users/${userId}/role`, payload);
      setUsers(
        users.map((u: any) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      if (["admin", "agent"].includes(newRole)) {
        setPasswordInputs((prev) => ({ ...prev, [userId]: "" }));
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handlePromote = async () => {
    setError("");
    if (!promoteEmail) return;
    try {
      try {
        await axios.post("/api/admin/users/promote", { email: promoteEmail });
      } catch (e: any) {
        if (e.response?.status === 404) {
          await axios.post("/api/admin/users/invite", { email: promoteEmail });
        } else {
          throw e;
        }
      }
      setPromoteEmail("");
      fetchUsers();
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to promote user");
    }
  };

  const handleSavePassword = async (userId: string, role: string) => {
    if (session?.user.role !== "superadmin") {
      alert("Only super admins can update credentials");
      return;
    }
    try {
      const pwd = passwordInputs[userId]?.trim() || "";
      if (["admin", "agent"].includes(role)) {
        if (!pwd || pwd.length < 8) {
          alert("Please provide a password (min 8 chars)");
          return;
        }
        await axios.put(`/api/admin/users/${userId}/role`, {
          role,
          password: pwd,
        });
        setPasswordInputs((prev) => ({ ...prev, [userId]: "" }));
      } else {
        alert("Saving credentials is available for admin/agent users");
      }
    } catch (e) {
      console.error("Error saving credentials:", e);
      alert("Failed to save credentials");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (session?.user.role !== "superadmin") {
      alert("Only super admins can delete admins");
      return;
    }
    setDeleteId(userId);
  };

  // Confirm dialog event handlers
  useEffect(() => {
    const onConfirm = async () => {
      if (!deleteId) return;
      await axios.delete(`/api/admin/users/${deleteId}`);
      setUsers((prev) => prev.filter((u: any) => u._id !== deleteId));
      setDeleteId(null);
    };
    const onOpenChange = (e: any) => {
      if (!e?.detail?.open) setDeleteId(null);
    };
    window.addEventListener("admin-user-delete:confirm", onConfirm as any);
    window.addEventListener(
      "admin-user-delete:open-change",
      onOpenChange as any
    );
    return () => {
      window.removeEventListener("admin-user-delete:confirm", onConfirm as any);
      window.removeEventListener(
        "admin-user-delete:open-change",
        onOpenChange as any
      );
    };
  }, [deleteId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage platform users
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Total: {users.length} users</CardDescription>
          </CardHeader>
          <CardContent>
            {session?.user.role === "superadmin" && (
              <div className="mb-4 space-y-2">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="admin@example.com"
                    value={promoteEmail}
                    onChange={(e) => setPromoteEmail(e.target.value)}
                    className="w-64"
                  />
                  <Button onClick={handlePromote}>Add Admin</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Super admin can promote an existing user by email to Admin
                  role.
                </p>
              </div>
            )}
            <div className="space-y-4">
              {users.map((user: any) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(user.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {session?.user.role === "superadmin" ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            handleRoleChange(user._id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {(user.role === "user" ||
                          user.role === "agent" ||
                          user.role === "admin") && (
                          <Input
                            type="password"
                            placeholder="Set password"
                            className="w-48"
                            value={passwordInputs[user._id] || ""}
                            onChange={(e) =>
                              setPasswordInputs((prev) => ({
                                ...prev,
                                [user._id]: e.target.value,
                              }))
                            }
                          />
                        )}
                        {(user.role === "agent" || user.role === "admin") && (
                          <Button
                            variant="default"
                            onClick={() =>
                              handleSavePassword(user._id, user.role)
                            }
                          >
                            Save
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Badge className="w-32 justify-center capitalize">
                        {user.role}
                      </Badge>
                    )}
                    {session?.user.role === "superadmin" &&
                      user.role === "admin" && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <ConfirmDialog
          open={!!deleteId}
          title="Delete admin user?"
          description="This action cannot be undone."
          confirmText="Delete"
          confirmEvent="admin-user-delete:confirm"
          openChangeEvent="admin-user-delete:open-change"
        />
      </div>
    </div>
  );
}

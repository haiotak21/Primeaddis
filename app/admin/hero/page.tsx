import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import HeroEditor from "@/components/admin/hero-editor";

export default async function Page() {
  const session = await getServerSession(authOptions as any);
  const role = session?.user?.role;
  if (!session || !(role === "admin" || role === "superadmin")) {
    // redirect non-admins to admin root
    redirect("/admin");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Hero</h1>
      {/* HeroEditor is a client component */}
      {/* @ts-expect-error Server -> Client component import */}
      <HeroEditor />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-[#F6F3EA]">
      <AdminNav username={admin!.username} />
      <main className="flex-1 p-4 sm:p-8 max-w-5xl">{children}</main>
    </div>
  );
}

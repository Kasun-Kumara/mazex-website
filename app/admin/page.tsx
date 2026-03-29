import AdminDashboardShell from "@/components/admin/AdminDashboardShell";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getAdminLabel } from "@/lib/appwrite";

export default async function AdminDashboardPage() {
  const currentAdmin = await getCurrentAdmin();
  const adminEmail = currentAdmin?.user.email ?? "admin@mazex.local";
  const adminName =
    currentAdmin?.user.name?.trim() || adminEmail.split("@")[0] || "Admin";
  const adminLabel = currentAdmin?.adminLabel ?? getAdminLabel();

  return (
    <AdminDashboardShell
      adminEmail={adminEmail}
      adminLabel={adminLabel || getAdminLabel()}
      adminName={adminName}
    />
  );
}

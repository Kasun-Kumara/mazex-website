import AdminDashboardShell from "@/components/admin/AdminDashboardShell";
import AdminSponsorsForm from "@/components/admin/AdminSponsorsForm";
import { listSponsors } from "@/lib/sponsors";

export default async function AdminSponsorsPage() {
  const sponsors = await listSponsors();

  return (
    <AdminDashboardShell>
      <AdminSponsorsForm sponsors={sponsors} />
    </AdminDashboardShell>
  );
}

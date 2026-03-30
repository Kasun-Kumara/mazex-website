import AdminSponsorsForm from "@/components/admin/AdminSponsorsForm";
import { listSponsors } from "@/lib/sponsors";

export default async function AdminSponsorsPage() {
  const sponsors = await listSponsors();

  return <AdminSponsorsForm sponsors={sponsors} />;
}

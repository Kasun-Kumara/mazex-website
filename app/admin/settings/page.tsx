import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  getGoogleSheetsConnectionForAdmin,
  isGoogleSheetsOAuthConfigured,
} from "@/lib/google-sheets";

export default async function AdminSettingsPage() {
  const currentAdmin = await getCurrentAdmin();
  const googleSheetsConnection = currentAdmin
    ? await getGoogleSheetsConnectionForAdmin(currentAdmin.user.$id)
    : null;

  return (
    <AdminSettingsForm
      googleSheetsConnection={googleSheetsConnection}
      googleSheetsOAuthConfigured={isGoogleSheetsOAuthConfigured()}
    />
  );
}

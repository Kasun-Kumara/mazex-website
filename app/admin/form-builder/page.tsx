import AdminRegistrationsManager from "@/components/admin/AdminRegistrationsManager";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  getGoogleSheetsConnectionForAdmin,
  isGoogleSheetsOAuthConfigured,
} from "@/lib/google-sheets";
import {
  getFormBannerUrl,
  getRegistrationFormBySlug,
  listRegistrationFormCards,
} from "@/lib/registrations";

type SearchParamsValue = string | string[] | undefined;

function readQuery(val: SearchParamsValue) {
  return Array.isArray(val) ? val[0] : val;
}

export default async function AdminFormBuilderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamsValue>>;
}) {
  const params = await searchParams;
  const formCards = await listRegistrationFormCards();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const forms = formCards.map(({ availability, ...form }) => form);
  const currentAdmin = await getCurrentAdmin();

  const slugParam = readQuery(params.form) ?? forms[0]?.slug ?? "";
  const selectedForm = slugParam ? await getRegistrationFormBySlug(slugParam) : null;
  const googleSheetsConnection = currentAdmin
    ? await getGoogleSheetsConnectionForAdmin(currentAdmin.user.$id)
    : null;

  const bannerUrl =
    selectedForm?.bannerFileId ? getFormBannerUrl(selectedForm.bannerFileId) : null;

  return (
    <AdminRegistrationsManager
      forms={forms}
      selectedForm={selectedForm}
      bannerUrl={bannerUrl}
      googleSheetsConnection={googleSheetsConnection}
      googleSheetsOAuthConfigured={isGoogleSheetsOAuthConfigured()}
    />
  );
}

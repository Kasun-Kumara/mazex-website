import { notFound } from "next/navigation";
import { getSponsorImage } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await context.params;
  const file = await getSponsorImage(fileId);

  if (!file) {
    notFound();
  }

  return new Response(file.buffer, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Disposition": `inline; filename="${file.fileName}"`,
      "Content-Type": file.contentType,
    },
  });
}

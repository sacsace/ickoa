import { serveUploadedFile } from "@/lib/serve-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return serveUploadedFile("uploads", path);
}

import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function historyRoots() {
  const roots: string[] = [];
  const envRoot =
    process.env.UPLOAD_ROOT?.trim() ||
    process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim();
  if (envRoot) roots.push(path.resolve(envRoot, "history"));
  roots.push(path.resolve(process.cwd(), "public", "history"));
  return roots;
}

function resolveSafe(root: string, parts: string[]) {
  const joined = path.resolve(root, ...parts);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (joined !== root && !joined.startsWith(rootWithSep)) return null;
  return joined;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await ctx.params;
  if (!parts?.length) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (parts.some((p) => !p || p === "." || p === "..")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  let filePath: string | null = null;
  for (const root of historyRoots()) {
    const candidate = resolveSafe(root, parts);
    if (candidate && existsSync(candidate) && statSync(candidate).isFile()) {
      filePath = candidate;
      break;
    }
  }

  if (!filePath) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const stream = createReadStream(filePath);
  const webStream = Readable.toWeb(stream) as unknown as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

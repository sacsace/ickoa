import { readFile, stat } from "fs/promises";
import path from "path";
import { getUploadRootPath } from "@/lib/s3";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
};

export async function serveUploadedFile(folder: string, segments: string[]) {
  if (!segments.length || segments.some((part) => !part || part === "." || part === "..")) {
    return new Response("Not found", { status: 404 });
  }

  const root = path.resolve(getUploadRootPath(), folder);
  const abs = path.resolve(root, ...segments);
  const relative = path.relative(root, abs);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const info = await stat(abs);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const data = await readFile(abs);
    const ext = path.extname(abs).slice(1).toLowerCase();
    return new Response(data, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

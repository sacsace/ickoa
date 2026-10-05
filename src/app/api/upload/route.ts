import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/s3";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const postId = formData.get("postId") as string;

  if (!file || !postId) {
    return NextResponse.json({ error: "Missing file or postId" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadFile(buffer, file.name, file.type);

  const attachment = await prisma.attachment.create({
    data: {
      postId,
      url,
      filename: file.name,
      mimeType: file.type,
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}

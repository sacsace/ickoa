import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const s3Configured =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET;

const s3 = s3Configured
  ? new S3Client({
      region: process.env.AWS_REGION ?? "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const key = `uploads/${Date.now()}-${filename}`;

  if (s3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? "ap-south-1"}.amazonaws.com/${key}`;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const localName = `${Date.now()}-${filename}`;
  await writeFile(path.join(uploadDir, localName), buffer);
  return `/uploads/${localName}`;
}

export async function uploadMagazineFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  return uploadToFolder(buffer, filename, mimeType, "magazine", "/magazine");
}

export async function uploadHeroFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  return uploadToFolder(buffer, filename, mimeType, "hero", "/hero");
}

export async function uploadGalleryFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  return uploadToFolder(buffer, filename, mimeType, "gallery", "/gallery");
}

async function uploadToFolder(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folder: string,
  publicPrefix: string,
): Promise<string> {
  const safeName = filename.replace(/[^\w.\-()]/g, "_");
  const key = `${folder}/${Date.now()}-${safeName}`;

  if (s3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? "ap-south-1"}.amazonaws.com/${key}`;
  }

  const uploadDir = path.join(process.cwd(), "public", folder);
  await mkdir(uploadDir, { recursive: true });
  const localName = `${Date.now()}-${safeName}`;
  await writeFile(path.join(uploadDir, localName), buffer);
  return `${publicPrefix}/${localName}`;
}

export async function deleteFile(url: string) {
  if (s3 && url.includes("amazonaws.com")) {
    const key = url.split(".amazonaws.com/")[1];
    if (key) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
        }),
      );
    }
  }
}

export function isS3Enabled() {
  return !!s3Configured;
}

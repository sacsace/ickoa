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

/** Railway 볼륨(/data) 또는 로컬 public 디렉터리 */
function getUploadRoot() {
  const fromEnv =
    process.env.UPLOAD_ROOT?.trim() ||
    process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim();
  if (fromEnv) return fromEnv;
  return path.join(process.cwd(), "public");
}

async function writeLocalFile(
  folder: string,
  filename: string,
  buffer: Buffer,
): Promise<string> {
  const safeName = filename.replace(/[^\w.\-()]/g, "_");
  const localName = `${Date.now()}-${safeName}`;
  const uploadDir = path.join(getUploadRoot(), folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, localName), buffer);
  return `/${folder}/${localName}`;
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const safeName = filename.replace(/[^\w.\-()]/g, "_");
  const key = `uploads/${Date.now()}-${safeName}`;

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

  return writeLocalFile("uploads", filename, buffer);
}

export async function uploadMagazineFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  return uploadToFolder(buffer, filename, mimeType, "magazine");
}

export async function uploadHeroFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  return uploadToFolder(buffer, filename, mimeType, "hero");
}

export async function uploadGalleryFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  return uploadToFolder(buffer, filename, mimeType, "gallery");
}

async function uploadToFolder(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folder: string,
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

  return writeLocalFile(folder, filename, buffer);
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

export function getUploadRootPath() {
  return getUploadRoot();
}

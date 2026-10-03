import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { requireUser } from "@/lib/guard";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

/**
 * Exercise photo upload.
 * Production (Vercel): streams into Vercel Blob when BLOB_READ_WRITE_TOKEN exists.
 * Local development: falls back to writing under /public/uploads so the whole
 * flow works offline without any token.
 */
export async function POST(req: NextRequest) {
  const { response, user } = await requireUser();
  if (response) return response;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "لم يتم إرفاق أي ملف" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "الصيغة غير مدعومة — استخدم JPG أو PNG أو WebP" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "حجم الصورة يتجاوز 5 ميغابايت" }, { status: 400 });
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const key = `exercises/${user.id}/${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  }

  // Local fallback path (development without Blob token).
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(uploadsDir, filename), buffer);
  return NextResponse.json({ url: `/uploads/${filename}` });
}

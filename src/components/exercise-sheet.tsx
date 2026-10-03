"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/http";
import { Sheet, PrimaryButton, GhostButton, FieldLabel, TextInput } from "@/components/ui";
import { categoryColor, categoryIcon } from "@/lib/categories";

interface CategoryLite {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ExerciseEditable {
  id: string;
  name: string;
  nameEn: string | null;
  categoryId: string;
  imageUrl: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  categories: CategoryLite[];
  presetCategoryId?: string | null;
  /** When provided, the sheet runs in edit mode. */
  exercise?: ExerciseEditable | null;
}

export default function ExerciseSheet({
  open,
  onClose,
  categories,
  presetCategoryId,
  exercise,
}: Props) {
  const router = useRouter();
  const isEdit = Boolean(exercise);

  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(exercise?.name ?? "");
      setNameEn(exercise?.nameEn ?? "");
      setCategoryId(exercise?.categoryId ?? presetCategoryId ?? categories[0]?.id ?? "");
      setImageUrl(exercise?.imageUrl ?? null);
      setError(null);
    }
  }, [open, exercise, presetCategoryId, categories]);

  async function onPickFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "فشل رفع الصورة");
      setImageUrl(data.url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة — حاول مجددًا");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("أدخل اسم التمرين");
      return;
    }
    if (!categoryId) {
      setError("اختر المجموعة العضلية");
      return;
    }
    setLoading(true);
    try {
      if (isEdit && exercise) {
        await api(`/api/exercises/${exercise.id}`, {
          method: "PATCH",
          json: {
            name: name.trim(),
            nameEn: nameEn.trim() || null,
            categoryId,
            imageUrl,
          },
        });
      } else {
        await api("/api/exercises", {
          method: "POST",
          json: {
            name: name.trim(),
            nameEn: nameEn.trim() || undefined,
            categoryId,
            imageUrl: imageUrl ?? undefined,
          },
        });
      }
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذر الحفظ — حاول مجددًا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? "تعديل التمرين" : "إضافة تمرين جديد"}>
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Photo upload — stored via Vercel Blob */}
        <div>
          <FieldLabel>صورة التمرين (اختياري)</FieldLabel>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPickFile(f);
              e.target.value = "";
            }}
          />
          {imageUrl ? (
            <div className="relative overflow-hidden rounded-2xl border border-iron-600">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="صورة التمرين" className="h-40 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-iron-950/90 to-transparent p-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-iron-800/90 py-2 text-xs font-bold text-white backdrop-blur"
                >
                  <Camera className="h-4 w-4" />
                  تغيير الصورة
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="flex items-center justify-center rounded-lg bg-rose-500/80 px-3 py-2 text-white backdrop-blur"
                  aria-label="إزالة الصورة"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-iron-600 bg-iron-800/50 text-slate-500 transition-colors hover:border-volt-500/50 hover:text-volt-400 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                  <span className="text-xs font-bold">جارٍ رفع الصورة...</span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs font-bold">اضغط لرفع صورة — جهاز، قبضة، أو إعداد</span>
                  <span className="text-[10px]">JPG · PNG · WebP — حتى 5 ميغابايت</span>
                </>
              )}
            </button>
          )}
        </div>

        <div>
          <FieldLabel>اسم التمرين</FieldLabel>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: ضغط البنش أو Bench Press"
            maxLength={160}
            required
          />
        </div>

        <div>
          <FieldLabel>الاسم الإنجليزي (اختياري)</FieldLabel>
          <TextInput
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Incline Dumbbell Press"
            dir="ltr"
            maxLength={160}
            className="text-start"
          />
        </div>

        <div>
          <FieldLabel>المجموعة العضلية</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c) => {
              const Icon = categoryIcon(c.icon);
              const col = categoryColor(c.color);
              const active = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all active:scale-95"
                  style={{
                    borderColor: active ? col.hex : "rgba(43,61,99,0.9)",
                    background: active ? col.soft : "rgba(22,34,60,0.5)",
                    color: active ? col.hex : "#94a3b8",
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-bold">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div role="alert" className="anim-pop rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <PrimaryButton loading={loading} disabled={loading || uploading}>
            {loading ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة التمرين"}
          </PrimaryButton>
          <GhostButton onClick={onClose}>إلغاء</GhostButton>
        </div>
      </form>
    </Sheet>
  );
}

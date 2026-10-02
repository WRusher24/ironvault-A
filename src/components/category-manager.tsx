"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  FolderPlus,
  Pencil,
  Plus,
  TriangleAlert,
  Trash2,
  X,
} from "lucide-react";
import { api, ApiError } from "@/lib/http";
import {
  CATEGORY_COLOR_KEYS,
  CATEGORY_ICON_KEYS,
  categoryColor,
  categoryIcon,
} from "@/lib/categories";
import { FieldLabel, TextInput } from "@/components/ui";

interface Cat {
  id: string;
  name: string;
  nameEn: string | null;
  icon: string;
  color: string;
}

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: Cat[];
}) {
  const router = useRouter();
  const [cats, setCats] = useState(initialCategories);
  const [editing, setEditing] = useState<Cat | "new" | null>(null);
  const [deleting, setDeleting] = useState<Cat | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [icon, setIcon] = useState("dumbbell");
  const [color, setColor] = useState("volt");

  function openEditor(cat: Cat | "new") {
    setEditing(cat);
    if (cat === "new") {
      setName("");
      setNameEn("");
      setIcon("dumbbell");
      setColor("volt");
    } else {
      setName(cat.name);
      setNameEn(cat.nameEn ?? "");
      setIcon(cat.icon);
      setColor(cat.color);
    }
    setError(null);
  }

  async function save() {
    if (!name.trim()) {
      setError("أدخل اسم الفئة");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (editing === "new") {
        const res = await api<{ category: Cat }>("/api/categories", {
          method: "POST",
          json: { name: name.trim(), nameEn: nameEn.trim() || null, icon, color },
        });
        setCats((prev) => [...prev, res.category]);
      } else if (editing) {
        const res = await api<{ category: Cat }>(`/api/categories/${editing.id}`, {
          method: "PATCH",
          json: { name: name.trim(), nameEn: nameEn.trim() || null, icon, color },
        });
        setCats((prev) => prev.map((c) => (c.id === res.category.id ? res.category : c)));
      }
      setEditing(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذر الحفظ");
    } finally {
      setBusy(false);
    }
  }

  async function remove(cat: Cat) {
    setBusy(true);
    try {
      await api(`/api/categories/${cat.id}`, { method: "DELETE" });
      setCats((prev) => prev.filter((c) => c.id !== cat.id));
      setDeleting(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذر الحذف");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white">إدارة الفئات</h2>
        <button
          onClick={() => openEditor("new")}
          className="flex items-center gap-1.5 rounded-full border border-volt-500/40 bg-volt-500/10 px-3.5 py-1.5 text-xs font-black text-volt-400 transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          فئة جديدة
        </button>
      </div>

      <div className="space-y-2">
        {cats.map((cat) => {
          const Icon = categoryIcon(cat.icon);
          const col = categoryColor(cat.color);
          return (
            <div key={cat.id} className="glass-card flex items-center gap-3 rounded-2xl p-3.5">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: col.soft, color: col.hex }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-white">{cat.name}</span>
                {cat.nameEn && (
                  <span className="block text-[11px] font-semibold text-slate-500">{cat.nameEn}</span>
                )}
              </span>
              <button
                onClick={() => openEditor(cat)}
                aria-label={`تعديل ${cat.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-iron-600 bg-iron-800 text-slate-400 transition-colors hover:text-white"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleting(cat)}
                aria-label={`حذف ${cat.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300/80 transition-colors hover:text-rose-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor sheet */}
      {editing && (
        <div className="anim-pop space-y-4 rounded-3xl border border-volt-500/30 bg-iron-850 p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black text-white">
              <FolderPlus className="h-4.5 w-4.5 text-volt-400" />
              {editing === "new" ? "فئة مخصصة جديدة" : `تعديل «${editing.name}»`}
            </h3>
            <button onClick={() => setEditing(null)} aria-label="إغلاق" className="text-slate-500 hover:text-white">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div>
            <FieldLabel>اسم الفئة بالعربية</FieldLabel>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: الساعد الأمامي"
              maxLength={120}
            />
          </div>
          <div>
            <FieldLabel>الاسم الإنجليزي (اختياري)</FieldLabel>
            <TextInput
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Forearms"
              dir="ltr"
              maxLength={120}
              className="text-start"
            />
          </div>

          <div>
            <FieldLabel>الأيقونة</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICON_KEYS.map((k) => {
                const Icon = categoryIcon(k);
                const active = icon === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setIcon(k)}
                    aria-label={k}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-90 ${
                      active
                        ? "border-volt-500 bg-volt-500/15 text-volt-400"
                        : "border-iron-600 bg-iron-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <FieldLabel>اللون</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLOR_KEYS.map((k) => {
                const c = categoryColor(k);
                const active = color === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setColor(k)}
                    title={c.label}
                    aria-label={c.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90"
                    style={{
                      background: c.soft,
                      border: `2px solid ${active ? c.hex : "transparent"}`,
                    }}
                  >
                    <span className="h-4 w-4 rounded-full" style={{ background: c.hex }}>
                      {active && <Check className="h-4 w-4 text-iron-950" strokeWidth={3.5} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm font-bold text-rose-300">{error}</p>}

          <button
            onClick={() => void save()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-volt-500 to-volt-600 py-3 text-sm font-black text-iron-950 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Check className="h-4.5 w-4.5" />
            {busy ? "جارٍ الحفظ..." : editing === "new" ? "إنشاء الفئة" : "حفظ التعديلات"}
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="anim-pop space-y-3 rounded-3xl border border-rose-500/40 bg-rose-500/5 p-5">
          <p className="flex items-start gap-2 text-sm font-bold leading-relaxed text-rose-200">
            <TriangleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            حذف «{deleting.name}» نهائيًا؟ سيتم حذف كل تمارين الفئة وسجلاتها معها —
            لا يمكن التراجع.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => void remove(deleting)}
              disabled={busy}
              className="flex-1 rounded-xl bg-rose-500 py-2.5 text-xs font-black text-white transition-all hover:bg-rose-400 active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? "جارٍ الحذف..." : "نعم، احذف الفئة"}
            </button>
            <button
              onClick={() => setDeleting(null)}
              className="flex-1 rounded-xl border border-iron-600 bg-iron-800 py-2.5 text-xs font-bold text-slate-300"
            >
              تراجع
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

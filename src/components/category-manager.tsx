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
  const [color, setColor] = useState("coral");

  function openEditor(cat: Cat | "new") {
    setEditing(cat);
    if (cat === "new") {
      setName("");
      setNameEn("");
      setIcon("dumbbell");
      setColor("coral");
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
      setError("Enter a category name");
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
      setError(err instanceof ApiError ? err.message : "Save failed");
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
      setError(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black" style={{ color: "var(--color-text)" }}>Manage Categories</h2>
        <button
          onClick={() => openEditor("new")}
          className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-black transition-all active:scale-95"
          style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }}
        >
          <Plus className="h-3.5 w-3.5" />
          New Category
        </button>
      </div>

      <div className="space-y-2">
        {cats.map((cat) => {
          const Icon = categoryIcon(cat.icon);
          const col = categoryColor(cat.color);
          return (
            <div key={cat.id} className="clean-card flex items-center gap-3 rounded-2xl p-3.5">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: col.soft, color: col.hex }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black" style={{ color: "var(--color-text)" }}>{cat.name}</span>
                {cat.nameEn && (
                  <span className="block text-[11px] font-semibold" style={{ color: "var(--color-text-faint)" }}>{cat.nameEn}</span>
                )}
              </span>
              <button
                onClick={() => openEditor(cat)}
                aria-label={`Edit ${cat.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-muted)" }}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleting(cat)}
                aria-label={`Delete ${cat.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor sheet */}
      {editing && (
        <div className="anim-pop space-y-4 rounded-3xl border p-5" style={{ borderColor: "var(--color-accent)", background: "var(--color-card)" }}>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black" style={{ color: "var(--color-text)" }}>
              <FolderPlus className="h-4.5 w-4.5" style={{ color: "var(--color-accent)" }} />
              {editing === "new" ? "New custom category" : `Edit "${editing.name}"`}
            </h3>
            <button onClick={() => setEditing(null)} aria-label="Close" style={{ color: "var(--color-text-faint)" }}>
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div>
            <FieldLabel>Category name</FieldLabel>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Forearms"
              maxLength={120}
            />
          </div>
          <div>
            <FieldLabel>English name (optional)</FieldLabel>
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
            <FieldLabel>Icon</FieldLabel>
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
                    className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-90"
                    style={
                      active
                        ? { borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent)" }
                        : { borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-faint)" }
                    }
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <FieldLabel>Color</FieldLabel>
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
                      {active && <Check className="h-4 w-4 text-white" strokeWidth={3.5} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm font-bold" style={{ color: "var(--color-accent)" }}>{error}</p>}

          <button
            onClick={() => void save()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: "var(--color-accent)" }}
          >
            <Check className="h-4.5 w-4.5" />
            {busy ? "Saving..." : editing === "new" ? "Create category" : "Save changes"}
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="anim-pop space-y-3 rounded-3xl border p-5" style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)" }}>
          <p className="flex items-start gap-2 text-sm font-bold leading-relaxed" style={{ color: "var(--color-accent-text)" }}>
            <TriangleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            Permanently delete &ldquo;{deleting.name}&rdquo;? All exercises and their logs in this category will also be deleted —
            this cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => void remove(deleting)}
              disabled={busy}
              className="flex-1 rounded-xl py-2.5 text-xs font-black text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: "var(--color-accent)" }}
            >
              {busy ? "Deleting..." : "Yes, delete category"}
            </button>
            <button
              onClick={() => setDeleting(null)}
              className="flex-1 rounded-xl border py-2.5 text-xs font-bold"
              style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-muted)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

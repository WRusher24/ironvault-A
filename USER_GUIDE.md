# IronVault — User Guide

Welcome to **IronVault** — your private vault for tracking progressive
overload and personal records (PRs) in the gym. The interface is fully English (LTR),
and all weights are logged strictly in **kilograms (kg)**.

---

## 1. Sign Up & Log In

1. Open the app → you'll land on **Log In**.
2. New here? Tap **Create your free account** and fill in:
   - **Name** — your name.
   - **Email or phone number** — email *or* phone number, your choice.
   - **Password** — at least 8 characters.
3. Tap **Create account & enter instantly** — no approval needed, your private vault opens instantly.
4. Next visits: log in with the same email/phone + password.

> Your vault is 100% private: no other user can see your exercises, categories, or PR history.

## 2. The Dashboard

After login you land directly on your dashboard:

- **Search bar** — type any part of an exercise name to filter exercises
  across every category instantly.
- **Muscle-group grid** — card per category (Chest, Back, Shoulders, Arms, Triceps,
  Legs, Core — plus your custom ones). Tap a card to expand its exercises.

## 3. Logging a PR (the 10-second flow)

1. Tap the big coral **+** button (center of the bottom bar — always available).
2. The **Log a New PR** sheet opens:
   - **Exercise** — search and pick an exercise, or just type a new name and choose its
     muscle group to create it on the spot.
   - **Weight (kg)** — use the ±2.5 steppers or quick chips, or type the exact number.
   - **Reps** — reps performed at that weight.
   - **Date** — defaults to today; you can backdate entries.
   - **Note** — optional cue like `Bar + 30kg` or `Inside grip`.
3. Tap **Save PR**.
4. **Beat your all-time max?** A confetti celebration fires with your **NEW PR!** card
   showing exactly how many kilos you gained over your previous record.

## 4. Exercise Detail, Graph & History

Tap any exercise to open its detail screen:

- **Hero** — exercise name, category chip, and its reference photo.
- **Stat chips** — current record weight, number of times you broke it, total entries.
- **Progress Chart** — a clean, straightforward line chart of weight over time flowing
  chronologically from left to right (older dates on the left, newer on the right).
  Tap any point to see its weight, reps, and date.
- **History Timeline** — the full chronological timeline (weight, reps, date, notes).
  Every row has **edit** (pencil) and **delete** (trash) buttons. Editing or deleting
  automatically re-computes which entries count as PRs.
- Tap **Log a new PR for this exercise** to log with the exercise pre-selected.
- Use the top-right icons to **edit the exercise** (rename, change category, swap photo)
  or **delete it entirely** (with confirmation).

## 5. Exercise Photos

When creating or editing an exercise:

1. Tap the dashed upload box and choose a photo (machine setup, grip reference…).
   JPEG / PNG / WebP up to 5 MB.
2. Photos are stored securely in **Vercel Blob** (production) and instantly appear in
   your dashboard rows, history, and the exercise hero.

## 6. Categories

Manage muscle groups from **Account → Manage Categories**:

- **New Category** — name it, pick an icon and an accent color.
- **Edit** any category with the pencil icon.
- **Delete** with the trash icon — warning: this also deletes its exercises and their logs
  (you'll be asked to confirm).

## 7. Theme Preferences

Visit **Account → Theme** to switch between:

- **Paper** — clean minimalist light (default).
- **Stone** — warm neutral tones.
- **Midnight** — dark mode.

## 8. Exporting Your Data (CSV)

1. Go to **Export** in the bottom bar (or Account → Export my data).
2. Review the live counters (entries / PRs / exercises included).
3. Tap **Download CSV now** — a bilingual (English/Arabic) spreadsheet downloads,
   opening perfectly in Excel and Google Sheets, with a `PR` column marking every record.

## 9. Navigation Reference

| Bottom bar item | Where it goes                                        |
| --------------- | ---------------------------------------------------- |
| **Home**        | Dashboard with search and category grid              |
| **History**     | Full chronological history of every entry, filterable by category |
| **+ (center)**  | Log a new PR from anywhere                           |
| **Export**      | CSV export center                                    |
| **Account**     | Profile, theme settings, category management, logout |

---

**Demo account** (from the seed script): `admin@ironvault.app` / `IronVault#2026` —
pre-loaded with ~14 weeks of realistic progression so you can explore graphs and
the timeline immediately.

Now go smash some records. Iron never lies.

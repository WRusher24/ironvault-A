# IronVault — User Guide

Welcome to **IronVault (آيرون فالت)** — your private vault for tracking progressive
overload and personal records (PRs) in the gym. The interface is fully Arabic (RTL),
but you can write exercise names and notes in English or Arabic freely. All weights
are logged strictly in **kilograms (kg)**.

---

## 1. Sign Up & Log In

1. Open the app → you'll land on **تسجيل الدخول** (Login).
2. New here? Tap **أنشئ حسابك مجانًا** and fill in:
   - **الاسم** — your name.
   - **البريد الإلكتروني أو رقم الهاتف** — email *or* phone number, your choice.
   - **كلمة المرور** — at least 8 characters.
3. Tap **إنشاء الحساب والدخول فورًا** — no approval needed, your private vault opens instantly.
4. Next visits: log in with the same email/phone + password.

> Your vault is 100% private: no other user can see your exercises, categories, or PR history.

## 2. The Dashboard (لوحة التحكم)

After login you land on your dashboard:

- **Greeting header** with your name and a stats strip:
  - **أرقام قياسية** — total PRs you've smashed.
  - **سلسلة النشاط** — your consecutive weekly training streak (+ "نشط هذا الأسبوع" badge).
  - **سجلات** — total logged entries and when your last PR happened.
- **تمرين اليوم المميز** — a featured exercise spotlight showing your current record on it.
- **Motivational line** — a dynamic sentence that celebrates recent PRs or pushes you
  back to the iron.
- **Search bar** — type any part of a name (Arabic or English) to filter exercises
  across every category instantly.
- **Muscle-group grid** — card per category (الصدر، الظهر، الأكتاف، الأذرع، الأرجل،
  plus your custom ones). Tap a card to expand its exercises.

## 3. Logging a PR (the 10-second flow)

1. Tap the big green **＋** button (center of the bottom bar — always available).
2. The **تسجيل رقم قياسي جديد** sheet opens:
   - **التمرين** — search and pick an exercise, or just type a new name and choose its
     muscle group to create it on the spot.
   - **الوزن (كجم)** — use the ±2.5 steppers or quick chips, or type the exact number.
   - **التكرارات** — reps performed at that weight.
   - **التاريخ** — defaults to today; you can backdate entries.
   - **ملاحظة** — optional cue like `Bar + 30kg` or `Inside Hammers`.
3. Tap **احفظ الرقم القياسي**.
4. **Beat your all-time max?** A neon confetti celebration fires with your **NEW PR!** card
   showing exactly how many kilos you gained over your previous record.

## 4. Exercise Detail, Graph & History

Tap any exercise to open its detail screen:

- **Hero** — exercise name (Arabic + English), category chip, and its reference photo.
- **Stat chips** — current record weight, number of times you broke it, total entries.
- **منحنى التقدم** — a sleek line chart of weight over time. Points marked **PR** glow green;
  tap any point to see its weight, reps, and date.
- **السجل الزمني** — the full chronological timeline (weight, reps, date, notes).
  Every row has **edit** (pencil) and **delete** (trash) buttons. Editing or deleting
  automatically re-computes which entries count as PRs.
- Tap **سجّل رقمًا جديدًا لهذا التمرين** to log with the exercise pre-selected.
- Use the top-right icons to **edit the exercise** (rename, change category, swap photo)
  or **delete it entirely** (with confirmation).

## 5. Exercise Photos

When creating or editing an exercise:

1. Tap the dashed upload box and choose a photo (machine setup, grip reference…).
   JPEG / PNG / WebP up to 5 MB.
2. Photos are stored securely in **Vercel Blob** (production) and instantly appear in
   your dashboard rows, history, and the exercise hero.

## 6. Categories

Manage muscle groups from **حسابي → إدارة الفئات**:

- **فئة جديدة** — name it in Arabic (+ optional English), pick an icon and a neon color.
- **Edit** any category with the pencil icon.
- **Delete** with the trash icon — warning: this also deletes its exercises and their logs
  (you'll be asked to confirm).

## 7. Exporting Your Data (CSV)

1. Go to **التصدير** in the bottom bar (or حسابي → تصدير بياناتي).
2. Review the live counters (entries / PRs / exercises included).
3. Tap **تحميل ملف CSV الآن** — a bilingual (Arabic/English) spreadsheet downloads,
   opening perfectly in Excel and Google Sheets, with a `PR` column marking every record.

## 8. Navigation Reference

| Bottom bar item | Where it goes                                        |
| --------------- | ---------------------------------------------------- |
| **الرئيسية**    | Dashboard with stats, search, and category grid      |
| **السجل**      | Full chronological history of every entry, filterable by category |
| **＋ (center)** | Log a new PR from anywhere                           |
| **التصدير**     | CSV export center                                    |
| **حسابي**      | Profile, stats, category management, logout         |

---

**Demo account** (from the seed script): `admin@ironvault.app` / `IronVault#2026` —
pre-loaded with ~14 weeks of realistic progression so you can explore graphs, PR badges,
and the timeline immediately.

Now go smash some records. الحديد لا يكذب.

/** Formatting helpers — Arabic-first, weights stay in Latin digits (gym convention). */

const arDate = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const arDateShort = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric",
  month: "short",
});

const arWeekday = new Intl.DateTimeFormat("ar-EG", {
  weekday: "long",
});

/** "١٢ يناير ٢٠٢٦" */
export function formatDateAr(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso + (iso.length === 10 ? "T00:00:00" : "")) : iso;
  return arDate.format(d);
}

/** "٥ مارس" */
export function formatDateArShort(iso: string): string {
  return arDateShort.format(new Date(iso + "T00:00:00"));
}

/** "السبت، ٥ مارس" */
export function formatDayAr(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${arWeekday.format(d)}، ${arDateShort.format(d)}`;
}

/** Today as YYYY-MM-DD (local time). */
export function todayIso(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Weight display: trims trailing zeros → "102.5", "90" */
export function formatWeight(w: number): string {
  return Number(w.toFixed(2)).toString();
}

/** How many whole days since an ISO date. */
export function daysSince(iso: string): number {
  const then = new Date(iso + "T00:00:00").getTime();
  const now = new Date(todayIso() + "T00:00:00").getTime();
  return Math.round((now - then) / 86_400_000);
}

/** Greeting by local hour — in Arabic. */
export function greetingAr(): string {
  const h = new Date().getHours();
  if (h < 5) return "ليلة حديدية";
  if (h < 12) return "صباح القوة";
  if (h < 17) return "نهارك حديد";
  if (h < 21) return "مساء القوة";
  return "ليلة حديدية";
}

interface MotivationInput {
  totalPrs: number;
  streakWeeks: number;
  lastPrDate: string | null;
  trainedThisWeek: boolean;
}

/** A dynamic, encouraging motivational line that adapts to recent activity. */
export function motivationalLine(input: MotivationInput): string {
  const { totalPrs, streakWeeks, lastPrDate, trainedThisWeek } = input;
  if (lastPrDate && daysSince(lastPrDate) <= 3) {
    return "وحش حقيقي! حطّمت رقمًا قياسيًا في الأيام الأخيرة — الحديد لا يكذب أبدًا.";
  }
  if (lastPrDate && daysSince(lastPrDate) <= 7) {
    return "أسبوع ذهبي! رقمك القياسي الأخير ما زال يتردد صداه في الصالة.";
  }
  if (totalPrs === 0) {
    return "كل بطل بدأ من الصفر. سجّل أول رقم قياسي لك اليوم وابدأ الأسطورة.";
  }
  if (streakWeeks >= 4) {
    return `${toArabicDigits(streakWeeks)} أسابيع من الانضباط الصارم — جسمك يُعيد تشكيل نفسه.`;
  }
  if (trainedThisWeek) {
    return "تدربت هذا الأسبوع، الخطوة القادمة: ارفع الحديد أكثر من المرة الماضية.";
  }
  return "الحديد ينتظرك. رقمك القياسي القادم أقرب مما تتخيل — اذهب واحصل عليه.";
}

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Convert Western digits to Eastern Arabic-Indic digits for prose. */
export function toArabicDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}

/** Relative "since" label in Arabic. */
export function sinceLabelAr(iso: string): string {
  const d = daysSince(iso);
  if (d <= 0) return "اليوم";
  if (d === 1) return "أمس";
  if (d === 2) return "قبل يومين";
  if (d <= 10) return `قبل ${toArabicDigits(d)} أيام`;
  if (d < 30) return `قبل ${toArabicDigits(d)} يومًا`;
  const weeks = Math.floor(d / 7);
  if (weeks < 5) return weeks === 1 ? "قبل أسبوع" : `قبل ${toArabicDigits(weeks)} أسابيع`;
  const months = Math.floor(d / 30);
  return months === 1 ? "قبل شهر" : `قبل ${toArabicDigits(months)} أشهر`;
}

/** Compute consecutive weekly training streak ending this week (or last). */
export function weeklyStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const weeks = new Set(dates.map((d) => weekKey(d)));
  let streak = 0;
  const cursor = new Date(todayIso() + "T00:00:00");
  // If nothing logged this week yet, streak may continue from last week.
  if (!weeks.has(weekKey(todayIso()))) {
    cursor.setDate(cursor.getDate() - 7);
  }
  while (weeks.has(weekKey(toIso(cursor)))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

function toIso(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Monday-based week identifier. */
function weekKey(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return toIso(d);
}

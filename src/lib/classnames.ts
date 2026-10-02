/** Tiny className combiner — filters falsy values. */
export function and(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

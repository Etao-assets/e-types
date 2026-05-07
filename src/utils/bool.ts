/** Normalise a "true"/"false" string or boolean to a boolean (or null). */
export function normBool(
  val: boolean | 'true' | 'false' | null | undefined,
): boolean | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'boolean') return val;
  return val === 'true';
}
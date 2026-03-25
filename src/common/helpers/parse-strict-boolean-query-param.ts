/**
 * Convierte un parámetro de query (strings típicamente) a boolean estricto.
 *
 * Reglas:
 * - `undefined`/`null` => `undefined` (para que el `@IsOptional()` funcione)
 * - boolean => boolean
 * - string "true"/"false" (case-insensitive) => boolean
 * - cualquier otro valor/string => lo devuelve tal cual para que `@IsBoolean()`
 *   falle y responda 400 (en vez de interpretarlo silenciosamente).
 */
export function parseStrictBooleanQueryParam(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    const v = value.toLowerCase().trim();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }

  return value;
}

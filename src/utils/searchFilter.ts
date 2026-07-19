/**
 * Sanitize a free-text search term before interpolating it into a PostgREST
 * `.or()` / `.ilike` filter expression.
 *
 * Characters like `,` `(` `)` `"` `*` `%` `\` are part of the PostgREST filter
 * grammar; left unescaped they let a user alter or break the query (filter
 * injection). We strip them and collapse whitespace — for substring (ILIKE)
 * search this loses nothing meaningful.
 */
export const sanitizeFilterValue = (value: string): string =>
  value.replace(/[,()"*\\%]/g, ' ').replace(/\s+/g, ' ').trim();

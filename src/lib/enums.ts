// SQLite doesn't support native database enums (Prisma requires Postgres,
// MySQL or CockroachDB for a real `enum` field), so MatchStatus is stored
// as a plain `String` column in prisma/schema.prisma. This constant is the
// single source of truth for the allowed values — the admin match editor
// and the server actions that validate incoming form data both import from
// here.
//
// Note: players have no position concept anywhere in this app. Formations
// in the squad builder are purely a visual pitch layout.

export const MATCH_STATUSES = ["SCHEDULED", "LIVE", "FINISHED", "POSTPONED"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];
export function isMatchStatus(value: string): value is MatchStatus {
  return (MATCH_STATUSES as readonly string[]).includes(value);
}

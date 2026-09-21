// The entire scoring system: a player's points are calculated from their
// season stats, never typed in directly. There is no gameweek/matchday
// breakdown — these are cumulative totals the admin edits as performances
// happen, and the points recalculate automatically every time.
//
//   Points = (Goals × 2) + (Under 5 × 3) + (MOTM × 1) + Extra Points
//
// No win points, no assist points, no appearance points.
export function calculatePlayerPoints(stats: {
  goals: number;
  motm: number;
  under5: number;
  extraPoints: number;
}): number {
  return stats.goals * 2 + stats.under5 * 3 + stats.motm * 1 + stats.extraPoints;
}

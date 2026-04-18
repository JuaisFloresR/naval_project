import { RowShip, InterpolationDetail } from '@/types';

/** The 20 hydrostatic numeric fields shared by RowShip and InterpolationDetail */
const HYDROSTATIC_FIELDS = [
  'displacement',
  'wl_length',
  'wl_beam',
  'wetted_area',
  'waterpl_area',
  'cp',
  'cb',
  'cm',
  'cwp',
  'lcb',
  'lcf',
  'kb',
  'bmt',
  'bml',
  'gmt',
  'gml',
  'kmt',
  'kml',
  'tpc',
  'mtc',
  'rm_at_1deg',
] as const;

type HydroField = (typeof HYDROSTATIC_FIELDS)[number];

/**
 * Performs linear interpolation between two RowShip reference rows.
 * Returns t=0 → rowLow values, t=1 → rowHigh values for all fields.
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * calculateLinearInterpolation
 *
 * Given a target draft and an array of reference rows (from a Ship's RowShip
 * data), finds the two bounding rows and returns a complete InterpolationDetail
 * object with all hydrostatic values linearly interpolated.
 *
 * - Rows are sorted by draft ascending internally.
 * - If targetDraft is below the minimum or above the maximum draft, the
 *   nearest boundary row values are returned (no extrapolation).
 * - If targetDraft exactly matches a reference row, that row's values are used.
 *
 * @param targetDraft  The draft (m) at which to interpolate.
 * @param referenceRows  The ship's RowShip dataset (at least one row required).
 * @returns A partial InterpolationDetail with all hydrostatic fields populated.
 *          The caller must add `id`, `createdAt`, and `interpolationId`.
 */
export function calculateLinearInterpolation(
  targetDraft: number,
  referenceRows: RowShip[],
): Omit<InterpolationDetail, 'id' | 'createdAt' | 'interpolationId'> {
  if (!referenceRows || referenceRows.length === 0) {
    throw new Error('No reference rows provided for interpolation.');
  }

  // Sort ascending by draft
  const sorted = [...referenceRows].sort((a, b) => Number(a.draft) - Number(b.draft));

  // Clamp: below minimum draft
  if (targetDraft <= Number(sorted[0].draft)) {
    const row = sorted[0];
    return buildResult(targetDraft, row, row, 0);
  }

  // Clamp: above maximum draft
  if (targetDraft >= Number(sorted[sorted.length - 1].draft)) {
    const row = sorted[sorted.length - 1];
    return buildResult(targetDraft, row, row, 0);
  }

  // Find bounding rows
  let lowIdx = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (Number(sorted[i].draft) <= targetDraft && targetDraft <= Number(sorted[i + 1].draft)) {
      lowIdx = i;
      break;
    }
  }

  const rowLow = sorted[lowIdx];
  const rowHigh = sorted[lowIdx + 1];
  const draftLow = Number(rowLow.draft);
  const draftHigh = Number(rowHigh.draft);

  // Interpolation factor t ∈ [0, 1]
  const t = draftHigh === draftLow ? 0 : (targetDraft - draftLow) / (draftHigh - draftLow);

  return buildResult(targetDraft, rowLow, rowHigh, t);
}

/** Builds the result object by interpolating every hydrostatic field. */
function buildResult(
  draft: number,
  rowLow: RowShip,
  rowHigh: RowShip,
  t: number,
): Omit<InterpolationDetail, 'id' | 'createdAt' | 'interpolationId'> {
  const result: Record<string, number> = { draft };

  for (const field of HYDROSTATIC_FIELDS) {
    const lo = Number(rowLow[field as keyof RowShip]);
    const hi = Number(rowHigh[field as keyof RowShip]);
    result[field] = parseFloat(lerp(lo, hi, t).toFixed(6));
  }

  return result as Omit<InterpolationDetail, 'id' | 'createdAt' | 'interpolationId'>;
}

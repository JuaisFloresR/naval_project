'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, TrendingUp, Anchor, AlertCircle, Loader2,
  RefreshCw, ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { Ship, RowShip, Interpolation } from '@/types';
import { calculateLinearInterpolation } from '@/utils/interpolation';

// ─── Types & Schema ──────────────────────────────────────────────────────────

const detailRowSchema = z.object({
  draft:        z.coerce.number(),
  displacement: z.coerce.number(),
  wl_length:    z.coerce.number(),
  wl_beam:      z.coerce.number(),
  wetted_area:  z.coerce.number(),
  waterpl_area: z.coerce.number(),
  cp:           z.coerce.number(),
  cb:           z.coerce.number(),
  cm:           z.coerce.number(),
  cwp:          z.coerce.number(),
  lcb:          z.coerce.number(),
  lcf:          z.coerce.number(),
  kb:           z.coerce.number(),
  bmt:          z.coerce.number(),
  bml:          z.coerce.number(),
  gmt:          z.coerce.number(),
  gml:          z.coerce.number(),
  kmt:          z.coerce.number(),
  kml:          z.coerce.number(),
  tpc:          z.coerce.number(),
  mtc:          z.coerce.number(),
  rm_at_1deg:   z.coerce.number(),
});

const formSchema = z.object({
  shipId:  z.string().min(1, 'Please select a ship'),
  details: z.array(detailRowSchema),
});

type FormValues = z.infer<typeof formSchema>;

// Column metadata — drives both table headers and field order
const COLUMNS: { key: keyof z.infer<typeof detailRowSchema>; label: string; unit: string }[] = [
  { key: 'draft',        label: 'Draft',        unit: 'm'     },
  { key: 'displacement', label: 'Displ.',        unit: 'TM'    },
  { key: 'wl_length',    label: 'WL Length',     unit: 'm'     },
  { key: 'wl_beam',      label: 'WL Beam',       unit: 'm'     },
  { key: 'wetted_area',  label: 'Wetted A.',     unit: 'm²'    },
  { key: 'waterpl_area', label: 'Waterpl. A.',   unit: 'm²'    },
  { key: 'cp',           label: 'Cp',            unit: '-'     },
  { key: 'cb',           label: 'Cb',            unit: '-'     },
  { key: 'cm',           label: 'Cm',            unit: '-'     },
  { key: 'cwp',          label: 'Cwp',           unit: '-'     },
  { key: 'lcb',          label: 'LCB',           unit: 'm'     },
  { key: 'lcf',          label: 'LCF',           unit: 'm'     },
  { key: 'kb',           label: 'KB',            unit: 'm'     },
  { key: 'bmt',          label: 'BMt',           unit: 'm'     },
  { key: 'bml',          label: 'BMl',           unit: 'm'     },
  { key: 'gmt',          label: 'GMt',           unit: 'm'     },
  { key: 'gml',          label: 'GMl',           unit: 'm'     },
  { key: 'kmt',          label: 'KMt',           unit: 'm'     },
  { key: 'kml',          label: 'KMl',           unit: 'm'     },
  { key: 'tpc',          label: 'TPC',           unit: 'TM/cm' },
  { key: 'mtc',          label: 'MTC',           unit: 'TM·m'  },
  { key: 'rm_at_1deg',   label: 'RM@1°',         unit: 'TM·m'  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface InterpolationFormProps {
  /** If provided, pre-populates the form → Edit mode */
  initialData?: Interpolation;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InterpolationForm({ initialData }: InterpolationFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  // Ship list & reference rows
  const [ships, setShips] = useState<Ship[]>([]);
  const [shipsLoading, setShipsLoading] = useState(true);
  const [referenceRows, setReferenceRows] = useState<RowShip[]>([]);
  const [refLoading, setRefLoading] = useState(false);

  // New draft input value (the "add row" field at the top)
  const [newDraft, setNewDraft] = useState<string>('');

  // Dialog states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── react-hook-form ────────────────────────────────────────────────────────
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shipId: initialData?.shipId ?? '',
      details: initialData?.details?.map((d) => ({
        draft:        Number(d.draft),
        displacement: Number(d.displacement),
        wl_length:    Number(d.wl_length),
        wl_beam:      Number(d.wl_beam),
        wetted_area:  Number(d.wetted_area),
        waterpl_area: Number(d.waterpl_area),
        cp:           Number(d.cp),
        cb:           Number(d.cb),
        cm:           Number(d.cm),
        cwp:          Number(d.cwp),
        lcb:          Number(d.lcb),
        lcf:          Number(d.lcf),
        kb:           Number(d.kb),
        bmt:          Number(d.bmt),
        bml:          Number(d.bml),
        gmt:          Number(d.gmt),
        gml:          Number(d.gml),
        kmt:          Number(d.kmt),
        kml:          Number(d.kml),
        tpc:          Number(d.tpc),
        mtc:          Number(d.mtc),
        rm_at_1deg:   Number(d.rm_at_1deg),
      })) ?? [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'details',
  });

  const watchedShipId = watch('shipId');

  // ── Fetch ships on mount ───────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/ships')
      .then((r) => r.json())
      .then((data: Ship[]) => setShips(data))
      .catch(console.error)
      .finally(() => setShipsLoading(false));
  }, []);

  // ── Fetch reference rows whenever selected ship changes ────────────────────
  const fetchReferenceRows = useCallback(async (shipId: string) => {
    if (!shipId) { setReferenceRows([]); return; }
    setRefLoading(true);
    try {
      const res = await fetch(`/api/ships/${shipId}`);
      if (!res.ok) throw new Error('Failed to load ship data');
      const data = await res.json();
      setReferenceRows(data.rows ?? []);
    } catch (e) {
      console.error(e);
      setReferenceRows([]);
    } finally {
      setRefLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferenceRows(watchedShipId);
  }, [watchedShipId, fetchReferenceRows]);

  // On edit mode, also load reference rows for the pre-selected ship
  useEffect(() => {
    if (initialData?.shipId) fetchReferenceRows(initialData.shipId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Interpolate & add a new detail row ────────────────────────────────────
  const handleAddDraft = () => {
    const draft = parseFloat(newDraft);
    if (isNaN(draft)) return;
    if (referenceRows.length === 0) {
      setErrorMsg('Select a ship with reference data before adding draft values.');
      setShowError(true);
      return;
    }
    const interpolated = calculateLinearInterpolation(draft, referenceRows);
    append({ ...interpolated, draft } as FormValues['details'][number]);
    setNewDraft('');
  };

  // ── Re-interpolate all values when draft cell changes ────────────────────
  const handleDraftChange = (index: number, rawValue: string) => {
    const draft = parseFloat(rawValue);
    if (isNaN(draft) || referenceRows.length === 0) return;
    const interpolated = calculateLinearInterpolation(draft, referenceRows);
    update(index, { ...interpolated, draft } as FormValues['details'][number]);
  };

  // ── Re-interpolate any hydrostatic cell when draft exists ─────────────────
  const handleFieldChange = (index: number, field: keyof FormValues['details'][number], rawValue: string) => {
    // For non-draft fields we just let the user type freely (manual override).
    // For draft field, we trigger full recalculation.
    if (field === 'draft') {
      handleDraftChange(index, rawValue);
    }
    // else: value is already bound through register, no extra action needed
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const onSubmit = async (data: FormValues) => {
    try {
      const url = isEditing ? `/api/interpolation/${initialData!.id}` : '/api/interpolation';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save interpolation');
      }

      setShowSuccess(true);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'An unexpected error occurred');
      setShowError(true);
    }
  };

  const canAddRow = referenceRows.length > 0 && newDraft !== '';

  // ── Recalculate all existing rows when reference data loads ───────────────
  const recalculateAll = () => {
    if (referenceRows.length === 0) return;
    const current = getValues('details');
    current.forEach((row, i) => {
      const interpolated = calculateLinearInterpolation(Number(row.draft), referenceRows);
      update(i, { ...interpolated, draft: Number(row.draft) } as FormValues['details'][number]);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-screen-xl mx-auto space-y-6">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                {isEditing ? 'Edit Interpolation' : 'New Interpolation'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isEditing
                  ? 'Update the hydrostatic interpolation record.'
                  : 'Select a ship and add target draft values to compute interpolated hydrostatics.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Ship Selector ──────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-blue-600" />
                  Reference Ship
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="shipId" className="text-sm font-medium text-gray-700">
                      Ship <span className="text-red-500">*</span>
                    </Label>
                    {shipsLoading ? (
                      <div className="h-10 rounded-md bg-gray-100 animate-pulse" />
                    ) : (
                      <Controller
                        control={control}
                        name="shipId"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(v) => {
                              field.onChange(v);
                              // Clear details when ship changes
                              setValue('details', []);
                            }}
                          >
                            <SelectTrigger
                              id="shipId"
                              className="h-10 border-gray-300 focus:ring-blue-500"
                            >
                              <SelectValue placeholder="— Select a ship —" />
                            </SelectTrigger>
                            <SelectContent>
                              {ships.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                  <span className="ml-2 text-xs text-gray-400">({s.type})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                    {errors.shipId && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.shipId.message}
                      </p>
                    )}
                  </div>

                  {/* Reference row status */}
                  <div className="flex items-center gap-3">
                    {refLoading && (
                      <span className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading reference data…
                      </span>
                    )}
                    {!refLoading && watchedShipId && referenceRows.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                        {referenceRows.length} reference rows loaded
                      </span>
                    )}
                    {!refLoading && watchedShipId && referenceRows.length === 0 && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        No reference rows for this ship
                      </span>
                    )}
                    {fields.length > 0 && referenceRows.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={recalculateAll}
                        className="ml-auto border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Recalculate All
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Add Draft Row ──────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-blue-600" />
                  Add Interpolated Draft Point
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="space-y-1.5 flex-1 max-w-xs">
                    <Label htmlFor="new-draft" className="text-sm font-medium text-gray-700">
                      Target Draft (m)
                    </Label>
                    <Input
                      id="new-draft"
                      type="number"
                      step="0.001"
                      placeholder="e.g. 4.250"
                      value={newDraft}
                      onChange={(e) => setNewDraft(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDraft())}
                      className="h-10 border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddDraft}
                    disabled={!canAddRow}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 h-10"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add &amp; Interpolate
                  </Button>
                  {!watchedShipId && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <ChevronDown className="h-3 w-3" />
                      Select a ship first
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── Detail Rows Table ──────────────────────────────────────── */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Interpolated Data Rows
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100 font-normal">
                    {fields.length} {fields.length === 1 ? 'row' : 'rows'}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {fields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center border-t border-gray-100">
                    <TrendingUp className="h-10 w-10 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">
                      No draft points yet. Enter a target draft above and click
                      <span className="font-medium text-blue-600"> Add &amp; Interpolate</span>.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border-t border-gray-100">
                    <table className="min-w-full text-xs">
                      {/* thead */}
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                            #
                          </th>
                          {COLUMNS.map((col) => (
                            <th
                              key={col.key}
                              className="px-2 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap min-w-[90px]"
                            >
                              <span>{col.label}</span>
                              <span className="block text-gray-400 font-normal normal-case tracking-normal text-[10px]">
                                {col.unit}
                              </span>
                            </th>
                          ))}
                          <th className="px-3 py-2.5 text-center font-semibold text-gray-500 uppercase tracking-wide">
                            Del.
                          </th>
                        </tr>
                      </thead>

                      {/* tbody */}
                      <tbody className="divide-y divide-gray-100">
                        {fields.map((field, index) => (
                          <tr
                            key={field.id}
                            className="hover:bg-blue-50/40 transition-colors duration-100 group"
                          >
                            {/* Row number */}
                            <td className="sticky left-0 z-10 bg-white group-hover:bg-blue-50/40 px-3 py-1.5 text-gray-400 font-mono whitespace-nowrap transition-colors duration-100">
                              {(index + 1).toString().padStart(2, '0')}
                            </td>

                            {/* Data cells */}
                            {COLUMNS.map((col) => (
                              <td key={col.key} className="px-1 py-1">
                                <input
                                  type="number"
                                  step="any"
                                  {...register(`details.${index}.${col.key}`, {
                                    valueAsNumber: true,
                                    onChange: (e) =>
                                      handleFieldChange(index, col.key, e.target.value),
                                  })}
                                  className={[
                                    'w-full min-w-[80px] rounded border px-2 py-1 text-xs font-mono',
                                    'focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400',
                                    'transition-colors duration-150',
                                    col.key === 'draft'
                                      ? 'bg-blue-50 border-blue-200 font-semibold text-blue-900'
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300',
                                  ].join(' ')}
                                />
                              </td>
                            ))}

                            {/* Delete */}
                            <td className="px-3 py-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                aria-label={`Remove row ${index + 1}`}
                                className="text-gray-300 hover:text-red-500 transition-colors duration-150 p-1 rounded"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Action Buttons ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 pb-8">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-base font-medium flex items-center gap-2 min-w-[160px]"
              >
                {isSubmitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  : isEditing ? 'Save Changes' : 'Create Interpolation'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="h-11 border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-base font-medium"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Success Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              {isEditing ? 'Changes Saved' : 'Interpolation Created'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'The interpolation record has been updated successfully.'
                : 'A new interpolation record has been created.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/interpolation')} className="bg-blue-600 hover:bg-blue-700">
              Go to Interpolations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Error Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Error
            </DialogTitle>
            <DialogDescription>{errorMsg}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowError(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

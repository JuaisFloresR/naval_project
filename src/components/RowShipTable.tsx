'use client';

import { z } from 'zod';
import { MeasurementTable } from './MeasurementTable';
import { RowShip, RowShipFormData } from '@/types';
import { ColumnConfig } from '@/lib/excel-utils';

interface RowShipTableProps {
  data: RowShip[];
  onAdd: (row: RowShipFormData) => void;
  onUpdate: (id: string, row: RowShipFormData) => void;
  onDelete: (id: string) => void;
  onImport: (rows: RowShipFormData[]) => void;
}

// Define column configuration for Ship hydrostatic measurements
const columns: ColumnConfig[] = [
  { key: 'draft',        label: 'Draft (m)',        excelHeader: 'Draft' },
  { key: 'displacement', label: 'Disp (TM)',        excelHeader: 'Displacement' },
  { key: 'wl_length',    label: 'WL Len (m)',       excelHeader: 'WL Length' },
  { key: 'wl_beam',      label: 'WL Beam (m)',      excelHeader: 'WL Beam' },
  { key: 'wetted_area',  label: 'Wet Area (m²)',    excelHeader: 'Wetted Area' },
  { key: 'waterpl_area', label: 'WP Area (m²)',     excelHeader: 'Waterplane Area' },
  { key: 'cp',           label: 'Cp',               excelHeader: 'Cp' },
  { key: 'cb',           label: 'Cb',               excelHeader: 'Cb' },
  { key: 'cm',           label: 'Cm',               excelHeader: 'Cm' },
  { key: 'cwp',          label: 'Cwp',              excelHeader: 'Cwp' },
  { key: 'lcb',          label: 'LCB (m)',          excelHeader: 'LCB' },
  { key: 'lcf',          label: 'LCF (m)',          excelHeader: 'LCF' },
  { key: 'kb',           label: 'KB (m)',           excelHeader: 'KB' },
  { key: 'bmt',          label: 'BMt (m)',          excelHeader: 'BMt' },
  { key: 'bml',          label: 'BML (m)',          excelHeader: 'BML' },
  { key: 'gmt',          label: 'GMt (m)',          excelHeader: 'GMt' },
  { key: 'gml',          label: 'GML (m)',          excelHeader: 'GML' },
  { key: 'kmt',          label: 'KMt (m)',          excelHeader: 'KMt' },
  { key: 'kml',          label: 'KML (m)',          excelHeader: 'KML' },
  { key: 'tpc',          label: 'TPC (TM/cm)',      excelHeader: 'TPC' },
  { key: 'mtc',          label: 'MTC (TM·m)',       excelHeader: 'MTC' },
  { key: 'rm_at_1deg',   label: 'RM@1° (TM·m)',    excelHeader: 'RM at 1deg' },
];

// Zod schema for validation
const RowShipFormDataSchema = z.object({
  draft:        z.number(),
  displacement: z.number(),
  wl_length:    z.number(),
  wl_beam:      z.number(),
  wetted_area:  z.number(),
  waterpl_area: z.number(),
  cp:           z.number(),
  cb:           z.number(),
  cm:           z.number(),
  cwp:          z.number(),
  lcb:          z.number(),
  lcf:          z.number(),
  kb:           z.number(),
  bmt:          z.number(),
  bml:          z.number(),
  gmt:          z.number(),
  gml:          z.number(),
  kmt:          z.number(),
  kml:          z.number(),
  tpc:          z.number(),
  mtc:          z.number(),
  rm_at_1deg:   z.number(),
});

// Column mapping for Excel import (maps schema keys to possible Excel column names)
const columnMapping: Record<string, string[]> = {
  draft:        ['Draft', 'draft', 'T'],
  displacement: ['Displacement', 'displacement', 'Disp'],
  wl_length:    ['WL Length', 'wl_length', 'WL Len'],
  wl_beam:      ['WL Beam', 'wl_beam'],
  wetted_area:  ['Wetted Area', 'wetted_area', 'Wet Area'],
  waterpl_area: ['Waterplane Area', 'waterpl_area', 'WP Area'],
  cp:           ['Cp', 'cp', 'CP'],
  cb:           ['Cb', 'cb', 'CB'],
  cm:           ['Cm', 'cm', 'CM'],
  cwp:          ['Cwp', 'cwp', 'CWP'],
  lcb:          ['LCB', 'lcb'],
  lcf:          ['LCF', 'lcf'],
  kb:           ['KB', 'kb'],
  bmt:          ['BMt', 'bmt', 'BMT'],
  bml:          ['BML', 'bml'],
  gmt:          ['GMt', 'gmt', 'GMT'],
  gml:          ['GML', 'gml'],
  kmt:          ['KMt', 'kmt', 'KMT'],
  kml:          ['KML', 'kml'],
  tpc:          ['TPC', 'tpc'],
  mtc:          ['MTC', 'mtc'],
  rm_at_1deg:   ['RM at 1deg', 'rm_at_1deg', 'RM@1°', 'RM at 1°'],
};

export function RowShipTable({ data, onAdd, onUpdate, onDelete, onImport }: RowShipTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <MeasurementTable<RowShip, RowShipFormData>
        data={data}
        columns={columns}
        title="Ship Hydrostatic Data"
        description="Manage ship hydrostatic measurement data"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onImport={onImport}
        excelExportFilename="ship-hydrostatics.xlsx"
        zodSchema={RowShipFormDataSchema}
        columnMapping={columnMapping}
      />
    </div>
  );
}
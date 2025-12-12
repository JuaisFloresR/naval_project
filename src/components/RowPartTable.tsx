'use client';

import { z } from 'zod';
import { MeasurementTable } from './MeasurementTable';
import { RowPart, RowPartFormData } from '@/types';
import { ColumnConfig } from '@/lib/excel-utils';

interface RowPartTableProps {
  data: RowPart[];
  onAdd: (row: RowPartFormData) => void;
  onUpdate: (id: string, row: RowPartFormData) => void;
  onDelete: (id: string) => void;
  onImport: (rows: RowPartFormData[]) => void;
}

// Define column configuration for Part measurements
const columns: ColumnConfig[] = [
  { key: 'value1', label: 'V1', excelHeader: 'Value 1' },
  { key: 'value2', label: 'V2', excelHeader: 'Value 2' },
  { key: 'value3', label: 'V3', excelHeader: 'Value 3' },
  { key: 'value4', label: 'V4', excelHeader: 'Value 4' },
  { key: 'value5', label: 'V5', excelHeader: 'Value 5' },
  { key: 'value6', label: 'V6', excelHeader: 'Value 6' },
  { key: 'value7', label: 'V7', excelHeader: 'Value 7' },
];

// Zod schema for validation
const RowPartFormDataSchema = z.object({
  value1: z.number(),
  value2: z.number(),
  value3: z.number(),
  value4: z.number(),
  value5: z.number(),
  value6: z.number(),
  value7: z.number(),
});

// Column mapping for Excel import (maps schema keys to possible Excel column names)
const columnMapping: Record<string, string[]> = {
  value1: ['Value 1', 'value1', 'V1'],
  value2: ['Value 2', 'value2', 'V2'],
  value3: ['Value 3', 'value3', 'V3'],
  value4: ['Value 4', 'value4', 'V4'],
  value5: ['Value 5', 'value5', 'V5'],
  value6: ['Value 6', 'value6', 'V6'],
  value7: ['Value 7', 'value7', 'V7'],
};

export function RowPartTable({ data, onAdd, onUpdate, onDelete, onImport }: RowPartTableProps) {
  return (
    <MeasurementTable<RowPart, RowPartFormData>
      data={data}
      columns={columns}
      title="Part Measurements"
      description="Manage part measurement data"
      onAdd={onAdd}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onImport={onImport}
      excelExportFilename="rowpart-data.xlsx"
      zodSchema={RowPartFormDataSchema}
      columnMapping={columnMapping}
    />
  );
}
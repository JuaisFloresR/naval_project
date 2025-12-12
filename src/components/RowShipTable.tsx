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

// Define column configuration for Ship measurements
const columns: ColumnConfig[] = [
  { key: 'value1', label: 'V1', excelHeader: 'Value 1' },
  { key: 'value2', label: 'V2', excelHeader: 'Value 2' },
  { key: 'value3', label: 'V3', excelHeader: 'Value 3' },
  { key: 'value4', label: 'V4', excelHeader: 'Value 4' },
  { key: 'value5', label: 'V5', excelHeader: 'Value 5' },
  { key: 'value6', label: 'V6', excelHeader: 'Value 6' },
  { key: 'value7', label: 'V7', excelHeader: 'Value 7' },
  { key: 'value8', label: 'V8', excelHeader: 'Value 8' },
  { key: 'value9', label: 'V9', excelHeader: 'Value 9' },
  { key: 'value10', label: 'V10', excelHeader: 'Value 10' },
  { key: 'value11', label: 'V11', excelHeader: 'Value 11' },
];

// Zod schema for validation
const RowShipFormDataSchema = z.object({
  value1: z.number(),
  value2: z.number(),
  value3: z.number(),
  value4: z.number(),
  value5: z.number(),
  value6: z.number(),
  value7: z.number(),
  value8: z.number(),
  value9: z.number(),
  value10: z.number(),
  value11: z.number(),
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
  value8: ['Value 8', 'value8', 'V8'],
  value9: ['Value 9', 'value9', 'V9'],
  value10: ['Value 10', 'value10', 'V10'],
  value11: ['Value 11', 'value11', 'V11'],
};

export function RowShipTable({ data, onAdd, onUpdate, onDelete, onImport }: RowShipTableProps) {
  return (
    <MeasurementTable<RowShip, RowShipFormData>
      data={data}
      columns={columns}
      title="Ship Measurements"
      description="Manage ship measurement data"
      onAdd={onAdd}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onImport={onImport}
      excelExportFilename="rowship-data.xlsx"
      zodSchema={RowShipFormDataSchema}
      columnMapping={columnMapping}
    />
  );
}
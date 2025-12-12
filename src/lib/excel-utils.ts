import ExcelJS from 'exceljs';
import { z, ZodSchema } from 'zod';

type RawExcelRow = Record<string, string>;

export interface ColumnConfig {
  key: string;
  label: string;
  excelHeader?: string; // Optional custom Excel header name
}

/**
 * Parse an Excel file and validate rows against a Zod schema
 */
export async function parseExcelFile<T>(
  file: File,
  schema: ZodSchema<T>,
  columnMapping?: Record<string, string[]> // Maps schema keys to possible Excel column names
): Promise<{ success: boolean; data?: T[]; error?: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return { success: false, error: 'No worksheet found in the Excel file' };
    }

    const jsonData: RawExcelRow[] = [];
    const headers: string[] = [];

    // Get headers from first row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.text || '';
    });

    // Process data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData: RawExcelRow = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.text || '';
        }
      });

      // Only add row if it has data
      if (Object.values(rowData).some(value => value !== '')) {
        jsonData.push(rowData);
      }
    });

    if (jsonData.length === 0) {
      return { success: false, error: 'The Excel file appears to be empty' };
    }

    // Validate and transform using Zod schema
    const validatedRows: T[] = [];
    const errors: string[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const rawRow = jsonData[i];
      
      // If column mapping provided, transform keys
      let transformedRow: Record<string, unknown> = {};
      if (columnMapping) {
        for (const [schemaKey, possibleExcelKeys] of Object.entries(columnMapping)) {
          for (const excelKey of possibleExcelKeys) {
            if (rawRow[excelKey] !== undefined) {
              const value = rawRow[excelKey];
              // Try to parse as number if it looks like a number
              transformedRow[schemaKey] = parseFloat(value) || 0;
              break;
            }
          }
        }
      } else {
        transformedRow = rawRow;
      }

      const result = schema.safeParse(transformedRow);
      if (result.success) {
        validatedRows.push(result.data);
      } else {
        errors.push(`Row ${i + 2}: ${result.error.message}`);
      }
    }

    if (errors.length > 0 && validatedRows.length === 0) {
      return { 
        success: false, 
        error: `Validation failed:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : ''}` 
      };
    }

    return { success: true, data: validatedRows };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to read Excel file' 
    };
  }
}

/**
 * Export data to Excel file
 */
export async function exportToExcel<T extends { id: string; createdAt: Date }>(
  data: T[],
  columns: ColumnConfig[],
  filename: string,
  additionalColumns?: { header: string; key: Extract<keyof T, string>; width?: number }[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Build column definitions
  const excelColumns: Partial<ExcelJS.Column>[] = [
    { header: 'ID', key: 'id', width: 15 },
    ...columns.map(col => ({
      header: col.excelHeader || col.label,
      key: col.key,
      width: 10,
    })),
  ];

  if (additionalColumns) {
    excelColumns.push(...additionalColumns);
  } else {
    excelColumns.push({ header: 'Created At', key: 'createdAt', width: 20 });
  }

  worksheet.columns = excelColumns;

  // Add data rows
  data.forEach(row => {
    const rowData: Record<string, unknown> = { id: row.id };
    
    columns.forEach(col => {
      rowData[col.key] = (row as Record<string, unknown>)[col.key];
    });

    if (additionalColumns) {
      additionalColumns.forEach(col => {
        rowData[col.key as string] = row[col.key];
      });
    } else {
      rowData.createdAt = row.createdAt.toISOString();
    }

    worksheet.addRow(rowData);
  });

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

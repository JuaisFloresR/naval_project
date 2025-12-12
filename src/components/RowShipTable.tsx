'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Plus, Upload, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { RowShip, RowShipFormData } from '@/types';
import ExcelJS from 'exceljs';

interface RowShipTableProps {
  data: RowShip[];
  onAdd: (row: RowShipFormData) => void;
  onUpdate: (id: string, row: RowShipFormData) => void;
  onDelete: (id: string) => void;
  onImport: (rows: RowShipFormData[]) => void;
}

type SortField = keyof RowShip | null;
type SortDirection = 'asc' | 'desc' | null;

export function RowShipTable({ data, onAdd, onUpdate, onDelete, onImport }: RowShipTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<RowShipFormData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRow, setNewRow] = useState<RowShipFormData>({
    value1: 0, value2: 0, value3: 0, value4: 0, value5: 0,
    value6: 0, value7: 0, value8: 0, value9: 0, value10: 0, value11: 0
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSort = (field: keyof RowShip) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof RowShip) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const handleEdit = (row: RowShip) => {
    setEditingId(row.id);
    setEditValues({
      value1: row.value1,
      value2: row.value2,
      value3: row.value3,
      value4: row.value4,
      value5: row.value5,
      value6: row.value6,
      value7: row.value7,
      value8: row.value8,
      value9: row.value9,
      value10: row.value10,
      value11: row.value11,
    });
  };

  const handleSaveEdit = () => {
    if (editingId && editValues) {
      onUpdate(editingId, editValues);
      setEditingId(null);
      setEditValues(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleAddRow = () => {
    onAdd(newRow);
    setNewRow({
      value1: 0, value2: 0, value3: 0, value4: 0, value5: 0,
      value6: 0, value7: 0, value8: 0, value9: 0, value10: 0, value11: 0
    });
    setIsAddModalOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No worksheet found in the Excel file');
      }

      type RawExcelRow = Record<string, string>;
      
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
        throw new Error('The Excel file appears to be empty');
      }

      // Convert to RowShipFormData format
      const rows: RowShipFormData[] = jsonData.map((row) => ({
        value1: parseFloat(row['Value 1'] || row.value1 || '0') || 0,
        value2: parseFloat(row['Value 2'] || row.value2 || '0') || 0,
        value3: parseFloat(row['Value 3'] || row.value3 || '0') || 0,
        value4: parseFloat(row['Value 4'] || row.value4 || '0') || 0,
        value5: parseFloat(row['Value 5'] || row.value5 || '0') || 0,
        value6: parseFloat(row['Value 6'] || row.value6 || '0') || 0,
        value7: parseFloat(row['Value 7'] || row.value7 || '0') || 0,
        value8: parseFloat(row['Value 8'] || row.value8 || '0') || 0,
        value9: parseFloat(row['Value 9'] || row.value9 || '0') || 0,
        value10: parseFloat(row['Value 10'] || row.value10 || '0') || 0,
        value11: parseFloat(row['Value 11'] || row.value11 || '0') || 0,
      }));

      onImport(rows);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to read Excel file');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('RowShip Data');

    // Add headers
    worksheet.columns = [
      { header: 'Ship ID', key: 'id', width: 15 },
      { header: 'Value 1', key: 'value1', width: 10 },
      { header: 'Value 2', key: 'value2', width: 10 },
      { header: 'Value 3', key: 'value3', width: 10 },
      { header: 'Value 4', key: 'value4', width: 10 },
      { header: 'Value 5', key: 'value5', width: 10 },
      { header: 'Value 6', key: 'value6', width: 10 },
      { header: 'Value 7', key: 'value7', width: 10 },
      { header: 'Value 8', key: 'value8', width: 10 },
      { header: 'Value 9', key: 'value9', width: 10 },
      { header: 'Value 10', key: 'value10', width: 10 },
      { header: 'Value 11', key: 'value11', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    // Add data
    sortedData.forEach(row => {
      worksheet.addRow({
        id: row.id,
        value1: row.value1,
        value2: row.value2,
        value3: row.value3,
        value4: row.value4,
        value5: row.value5,
        value6: row.value6,
        value7: row.value7,
        value8: row.value8,
        value9: row.value9,
        value10: row.value10,
        value11: row.value11,
        createdAt: row.createdAt.toISOString(),
      });
    });

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rowship-data.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderEditableCell = (field: keyof RowShipFormData, value: number, rowId: string) => {
    if (editingId === rowId && editValues) {
      return (
        <Input
          type="number"
          step="0.01"
          value={editValues[field]}
          onChange={(e) => setEditValues({ ...editValues, [field]: parseFloat(e.target.value) || 0 })}
          className="h-8 transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
      );
    }
    return <span className="text-gray-900">{value.toFixed(2)}</span>;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Ship Measurements</h3>
          <p className="text-sm text-gray-600 mt-1">
            {data.length} row{data.length !== 1 ? 's' : ''} • Manage ship measurement data
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import Excel'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={data.length === 0}
            className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* Import Error */}
      {importError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-600 text-xs">⚠</span>
            </div>
            {importError}
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-900 py-4 px-4 lg:px-6">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('id')}
                      className="h-auto p-0 font-semibold text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Ship ID
                      {getSortIcon('id')}
                    </Button>
                  </TableHead>
                  {Array.from({ length: 11 }, (_, i) => (
                    <TableHead key={i} className="font-semibold text-gray-900 text-center py-4 px-2 lg:px-3">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(`value${i + 1}` as keyof RowShip)}
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-gray-100 transition-colors duration-200 text-xs lg:text-sm"
                      >
                        V{i + 1}
                        {getSortIcon(`value${i + 1}` as keyof RowShip)}
                      </Button>
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-semibold text-gray-900 py-4 px-4 lg:px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row, index) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200">
                    <TableCell className="font-mono text-sm py-4 px-6 text-gray-700">{row.id}</TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value1', row.value1, row.id)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value2', row.value2, row.id)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value3', row.value3, row.id)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value4', row.value4, row.id)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value5', row.value5, row.id)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value6', row.value6, row.id)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value7', row.value7, row.id)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value8', row.value8, row.id)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value9', row.value9, row.id)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value10', row.value10, row.id)}
                    </TableCell>
                    <TableCell className="text-center py-4 px-3">
                      {renderEditableCell('value11', row.value11, row.id)}
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      {editingId === row.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit} className="h-8 px-3 bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8 px-3 border-gray-300 hover:bg-gray-50 transition-colors duration-200">
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border border-gray-200 shadow-lg">
                            <DropdownMenuItem onClick={() => handleEdit(row)} className="hover:bg-gray-50 transition-colors duration-200">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(row.id)}
                              className="text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Tablet Table View */}
      <div className="hidden md:block lg:hidden">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-900 py-3 px-3">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('id')}
                      className="h-auto p-0 font-semibold text-gray-900 hover:bg-gray-100 transition-colors duration-200 text-sm"
                    >
                      ID
                      {getSortIcon('id')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center py-3 px-2">Values 1-6</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center py-3 px-2">Values 7-11</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 py-3 px-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row, index) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200">
                    <TableCell className="font-mono text-sm py-3 px-3 text-gray-700">{row.id}</TableCell>
                    <TableCell className="py-3 px-2">
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        {Array.from({ length: 6 }, (_, i) => {
                          const valueKey = `value${i + 1}` as keyof RowShip;
                          const value = row[valueKey] as number;
                          return (
                            <div key={i} className="text-center p-1 bg-gray-50 rounded">
                              <span className="text-gray-600">V{i + 1}:</span>
                              <span className="font-medium ml-1">{value.toFixed(1)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-2">
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        {Array.from({ length: 5 }, (_, i) => {
                          const valueKey = `value${i + 7}` as keyof RowShip;
                          const value = row[valueKey] as number;
                          return (
                            <div key={i} className="text-center p-1 bg-gray-50 rounded">
                              <span className="text-gray-600">V{i + 7}:</span>
                              <span className="font-medium ml-1">{value.toFixed(1)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3 px-3">
                      {editingId === row.id ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleSaveEdit} className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 px-2 text-xs border-gray-300 hover:bg-gray-50 transition-colors duration-200">
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-gray-100 transition-colors duration-200">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border border-gray-200 shadow-lg">
                            <DropdownMenuItem onClick={() => handleEdit(row)} className="hover:bg-gray-50 transition-colors duration-200 text-sm">
                              <Edit className="mr-2 h-3 w-3" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(row.id)}
                              className="text-red-600 hover:bg-red-50 transition-colors duration-200 text-sm"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3 sm:space-y-4">
        {sortedData.map((row) => (
          <Card key={row.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">ID: {row.id}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Created: {row.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200 ml-2 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border border-gray-200 shadow-lg w-40">
                    <DropdownMenuItem onClick={() => handleEdit(row)} className="hover:bg-gray-50 transition-colors duration-200 text-sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteId(row.id)}
                      className="text-red-600 hover:bg-red-50 transition-colors duration-200 text-sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {editingId === row.id && editValues ? (
                <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: 11 }, (_, i) => (
                      <div key={i} className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">Value {i + 1}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editValues[`value${i + 1}` as keyof RowShipFormData]}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            [`value${i + 1}`]: parseFloat(e.target.value) || 0
                          })}
                          className="h-10 sm:h-9 text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="flex-1 h-10 sm:h-9 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base font-medium"
                    >
                      Save Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1 h-10 sm:h-9 border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-sm">
                  {Array.from({ length: 11 }, (_, i) => {
                    const valueKey = `value${i + 1}` as keyof RowShip;
                    const value = row[valueKey] as number;
                    return (
                      <div key={i} className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-xs text-gray-600 font-medium block">V{i + 1}</span>
                        <p className="font-semibold text-gray-900 mt-1 text-sm sm:text-base">{value.toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No measurement rows yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first measurement row or importing data from Excel.</p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Row
            </Button>
          </div>
        </div>
      )}

      {/* Add Row Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">Add New Measurement Row</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-4 sm:py-6">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="space-y-2 sm:space-y-3">
                <Label htmlFor={`value${i + 1}`} className="text-sm font-medium text-gray-700">
                  Value {i + 1}
                </Label>
                <Input
                  id={`value${i + 1}`}
                  type="number"
                  step="0.01"
                  value={newRow[`value${i + 1}` as keyof RowShipFormData]}
                  onChange={(e) => setNewRow({
                    ...newRow,
                    [`value${i + 1}`]: parseFloat(e.target.value) || 0
                  })}
                  className="h-11 sm:h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="h-11 sm:h-10 border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-base font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRow}
              className="h-11 sm:h-10 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-base font-medium"
            >
              Add Row
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the measurement row
              and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Row
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
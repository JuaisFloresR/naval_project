'use client';

import { useState, useRef } from 'react';
import { ZodSchema } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Plus, Upload, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { parseExcelFile, exportToExcel, ColumnConfig } from '@/lib/excel-utils';

interface MeasurementTableProps<TRow extends { id: string; createdAt: Date }, TFormData extends Record<string, number>> {
  data: TRow[];
  columns: ColumnConfig[];
  title: string;
  description: string;
  onAdd: (row: TFormData) => void;
  onUpdate: (id: string, row: TFormData) => void;
  onDelete: (id: string) => void;
  onImport: (rows: TFormData[]) => void;
  excelExportFilename: string;
  zodSchema: ZodSchema<TFormData>;
  columnMapping: Record<string, string[]>;
}

type SortField = string | null;
type SortDirection = 'asc' | 'desc' | null;

export function MeasurementTable<TRow extends { id: string; createdAt: Date }, TFormData extends Record<string, number>>({
  data,
  columns,
  title,
  description,
  onAdd,
  onUpdate,
  onDelete,
  onImport,
  excelExportFilename,
  zodSchema,
  columnMapping,
}: MeasurementTableProps<TRow, TFormData>) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<TFormData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRow, setNewRow] = useState<TFormData>(() => {
    const initial = {} as TFormData;
    columns.forEach(col => {
      (initial as Record<string, number>)[col.key] = 0;
    });
    return initial;
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSort = (field: string) => {
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

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    const aValue = (a as Record<string, unknown>)[sortField];
    const bValue = (b as Record<string, unknown>)[sortField];

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

  const handleEdit = (row: TRow) => {
    setEditingId(row.id);
    const values = {} as TFormData;
    columns.forEach(col => {
      (values as Record<string, number>)[col.key] = (row as Record<string, unknown>)[col.key] as number;
    });
    setEditValues(values);
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
    const resetRow = {} as TFormData;
    columns.forEach(col => {
      (resetRow as Record<string, number>)[col.key] = 0;
    });
    setNewRow(resetRow);
    setIsAddModalOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    const result = await parseExcelFile(file, zodSchema, columnMapping);

    if (result.success && result.data) {
      onImport(result.data);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setImportError(result.error || 'Failed to import file');
    }

    setIsImporting(false);
  };

  const handleExport = async () => {
    await exportToExcel(sortedData, columns, excelExportFilename);
  };

  const renderEditableCell = (field: string, value: number, rowId: string) => {
    if (editingId === rowId && editValues) {
      return (
        <Input
          type="number"
          step="0.01"
          value={(editValues as Record<string, number>)[field]}
          onChange={(e) => setEditValues({ ...editValues, [field]: parseFloat(e.target.value) || 0 } as TFormData)}
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
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {data.length} row{data.length !== 1 ? 's' : ''} • {description}
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
                      ID
                      {getSortIcon('id')}
                    </Button>
                  </TableHead>
                  {columns.map((col) => (
                    <TableHead key={col.key} className="font-semibold text-gray-900 text-center py-4 px-2 lg:px-3">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(col.key)}
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-gray-100 transition-colors duration-200 text-xs lg:text-sm"
                      >
                        {col.label}
                        {getSortIcon(col.key)}
                      </Button>
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-semibold text-gray-900 py-4 px-4 lg:px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200">
                    <TableCell className="font-mono text-sm py-4 px-6 text-gray-700">{row.id}</TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} className="text-center py-4 px-3">
                        {renderEditableCell(col.key, (row as Record<string, unknown>)[col.key] as number, row.id)}
                      </TableCell>
                    ))}
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
                  <TableHead className="font-semibold text-gray-900 text-center py-3 px-2">Values</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 py-3 px-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200">
                    <TableCell className="font-mono text-sm py-3 px-3 text-gray-700">{row.id}</TableCell>
                    <TableCell className="py-3 px-2">
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        {columns.map((col) => {
                          const value = (row as Record<string, unknown>)[col.key] as number;
                          return (
                            <div key={col.key} className="text-center p-1 bg-gray-50 rounded">
                              <span className="text-gray-600">{col.label}:</span>
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
                    {columns.map((col) => (
                      <div key={col.key} className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">{col.label}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(editValues as Record<string, number>)[col.key]}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            [col.key]: parseFloat(e.target.value) || 0
                          } as TFormData)}
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
                  {columns.map((col) => {
                    const value = (row as Record<string, unknown>)[col.key] as number;
                    return (
                      <div key={col.key} className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-xs text-gray-600 font-medium block">{col.label}</span>
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
            {columns.map((col) => (
              <div key={col.key} className="space-y-2 sm:space-y-3">
                <Label htmlFor={col.key} className="text-sm font-medium text-gray-700">
                  {col.label}
                </Label>
                <Input
                  id={col.key}
                  type="number"
                  step="0.01"
                  value={(newRow as Record<string, number>)[col.key]}
                  onChange={(e) => setNewRow({
                    ...newRow,
                    [col.key]: parseFloat(e.target.value) || 0
                  } as TFormData)}
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

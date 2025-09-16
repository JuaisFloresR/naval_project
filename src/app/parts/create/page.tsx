'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PartForm from '@/components/PartForm';
import { RowPartTable } from '@/components/RowPartTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PartFormData, RowPart, RowPartFormData } from '@/types';

export default function CreatePartPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RowPart[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (data: PartFormData) => {
    // Include rows in the form data
    const partData = {
      ...data,
      rows: rows,
    };

    // Placeholder for backend integration - replace with actual Prisma create
    // e.g., await prisma.part.create({ data: partData });

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90% success rate for demo
            resolve('Part created successfully');
          } else {
            reject(new Error('Failed to create part. Please try again.'));
          }
        }, 1000);
      });

      setShowSuccess(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setShowError(true);
    }
  };

  const handleAddRow = (rowData: RowPartFormData) => {
    const newRow: RowPart = {
      id: `row-${Date.now()}`,
      ...rowData,
      createdAt: new Date(),
    };
    setRows([...rows, newRow]);
  };

  const handleUpdateRow = (id: string, rowData: RowPartFormData) => {
    setRows(rows.map(row =>
      row.id === id
        ? { ...row, ...rowData }
        : row
    ));
  };

  const handleDeleteRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleImportRows = (importedRows: RowPartFormData[]) => {
    const newRows: RowPart[] = importedRows.map((rowData, index) => ({
      id: `imported-${Date.now()}-${index}`,
      ...rowData,
      createdAt: new Date(),
    }));
    setRows([...rows, ...newRows]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Part</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Create a new part entry in your inventory
            </p>
          </div>

          {/* Part Form */}
          <PartForm onSubmit={handleSubmit} />

          {/* RowPart Table */}
          <Card className="max-w-7xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Part Data Rows</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Add and manage measurement data rows for this part
              </p>
            </CardHeader>
            <CardContent>
              <RowPartTable
                data={rows}
                onAdd={handleAddRow}
                onUpdate={handleUpdateRow}
                onDelete={handleDeleteRow}
                onImport={handleImportRows}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription>Part created successfully.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/parts')}>Go to Parts</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowError(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ShipForm from '@/components/ShipForm';
import { RowShipTable } from '@/components/RowShipTable';
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
import { ShipFormData, RowShip, RowShipFormData } from '@/types';

export default function CreateShipPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RowShip[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (data: ShipFormData) => {
    // Include rows in the form data
    const shipData = {
      ...data,
      rows: rows,
    };

    // Placeholder for backend integration - replace with actual Prisma create
    // e.g., await prisma.ship.create({ data: shipData });

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90% success rate for demo
            resolve('Ship created successfully');
          } else {
            reject(new Error('Failed to create ship. Please try again.'));
          }
        }, 1000);
      });

      setShowSuccess(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setShowError(true);
    }
  };

  const handleAddRow = (rowData: RowShipFormData) => {
    const newRow: RowShip = {
      id: `row-${Date.now()}`,
      ...rowData,
      createdAt: new Date(),
    };
    setRows([...rows, newRow]);
  };

  const handleUpdateRow = (id: string, rowData: RowShipFormData) => {
    setRows(rows.map(row =>
      row.id === id
        ? { ...row, ...rowData }
        : row
    ));
  };

  const handleDeleteRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleImportRows = (importedRows: RowShipFormData[]) => {
    const newRows: RowShip[] = importedRows.map((rowData, index) => ({
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Ship</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Create a new ship entry in your fleet
            </p>
          </div>

        {/* Ship Form */}
        <ShipForm onSubmit={handleSubmit} />

        {/* RowShip Table */}
        <Card className="max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Ship Data Rows</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Add and manage measurement data rows for this ship
            </p>
          </CardHeader>
          <CardContent>
            <RowShipTable
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
            <DialogDescription>Ship created successfully.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/ships')}>Go to Ships</Button>
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
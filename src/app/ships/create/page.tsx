'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ShipForm from '@/components/ShipForm';
import { RowShipTable } from '@/components/RowShipTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShipFormData, RowShip, RowShipFormData } from '@/types';

export default function CreateShipPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RowShip[]>([]);

  const handleSubmit = (data: ShipFormData) => {
    // Include rows in the form data
    const shipData = {
      ...data,
      rows: rows,
    };

    // Placeholder for backend integration
    console.log('Creating ship:', shipData);

    // Simulate API call delay
    setTimeout(() => {
      router.push('/ships');
    }, 500);
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
    </div>
  );
}
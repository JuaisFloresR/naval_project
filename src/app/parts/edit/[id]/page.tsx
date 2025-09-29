'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
import { Part, PartFormData, RowPart, RowPartFormData } from '@/types';

// Sample parts data (same as in the list page)
const sampleParts = [
  {
    id: 'p1',
    name: 'Main Engine',
    description: 'Primary propulsion engine for the battleship',
    shipId: '1',
    createdAt: new Date(2024, 0, 1),
  },
  {
    id: 'p2',
    name: 'Aircraft Radar',
    description: 'Advanced radar system for aircraft detection and tracking',
    shipId: '2',
    createdAt: new Date(2024, 0, 15),
  },
  {
    id: 'p3',
    name: 'Lifeboat System',
    description: 'Emergency evacuation lifeboats and davits',
    shipId: '3',
    createdAt: new Date(2024, 1, 1),
  },
  {
    id: 'p4',
    name: 'Container Crane',
    description: 'Cargo handling crane for loading and unloading containers',
    shipId: '4',
    createdAt: new Date(2024, 1, 15),
  },
];

export default function EditPartPage() {
  const params = useParams();
  const router = useRouter();
  const [part, setPart] = useState<Part | null>(null);
  const [rows, setRows] = useState<RowPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Simulate fetching part data and its rows
    const partId = params.id as string;
    const foundPart = sampleParts.find(p => p.id === partId);

    // Sample row data for demonstration (2 rows per part)
    const sampleRows: RowPart[] = [
      {
        id: `row-${partId}-1`,
        value1: 10.5 + Math.random() * 5,
        value2: 20.3 + Math.random() * 5,
        value3: 15.7 + Math.random() * 5,
        value4: 8.9 + Math.random() * 5,
        value5: 12.1 + Math.random() * 5,
        value6: 25.4 + Math.random() * 5,
        value7: 18.6 + Math.random() * 5,
        createdAt: new Date('2024-01-15'),
        partId: partId,
      },
      {
        id: `row-${partId}-2`,
        value1: 11.2 + Math.random() * 5,
        value2: 19.8 + Math.random() * 5,
        value3: 16.1 + Math.random() * 5,
        value4: 9.3 + Math.random() * 5,
        value5: 13.5 + Math.random() * 5,
        value6: 24.9 + Math.random() * 5,
        value7: 17.2 + Math.random() * 5,
        createdAt: new Date('2024-01-20'),
        partId: partId,
      },
    ];

    setTimeout(() => {
      setPart(foundPart || null);
      setRows(foundPart ? sampleRows : []);
      setLoading(false);
    }, 300);
  }, [params.id]);

  const handleSubmit = async (data: PartFormData) => {
    // Include rows in the form data
    const partData = {
      ...data,
      rows: rows,
    };

    // Placeholder for backend integration - replace with actual Prisma update
    // e.g., await prisma.part.update({ where: { id: params.id }, data: partData });

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90% success rate for demo
            resolve('Part updated successfully');
          } else {
            reject(new Error('Failed to update part. Please try again.'));
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
      partId: params.id as string,
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
      partId: params.id as string,
    }));
    setRows([...rows, ...newRows]);
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading part data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Part Not Found</h1>
            <p className="text-gray-600 mb-6">The part you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/parts')}>
              Back to Parts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Part</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Update the information for {part.name}
            </p>
          </div>

          {/* Part Form */}
          <PartForm
            initialData={{
              name: part.name,
              description: part.description,
              shipId: part.shipId,
            }}
            onSubmit={handleSubmit}
            isEditing={true}
          />

          {/* RowPart Table */}
          <Card className="max-w-7xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Part Data Rows</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage measurement data rows for {part.name}
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
            <DialogDescription>Part updated successfully.</DialogDescription>
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
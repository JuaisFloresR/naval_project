'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
import { Ship, ShipFormData, RowShip, RowShipFormData, ShipStatus } from '@/types';

// Sample ship data (same as in the list page)
const sampleShips: Ship[] = [
  {
    id: '1',
    name: 'HMS Victory',
    type: 'Battleship',
    length: 69.6,
    width: 15.8,
    height: 20.5,
    description: 'Historic British warship famous for the Battle of Trafalgar.',
    status: 'RETIRED',
    createdAt: new Date('1765-05-07'),
  },
  {
    id: '2',
    name: 'USS Enterprise',
    type: 'Aircraft Carrier',
    length: 342.0,
    width: 78.0,
    height: 76.0,
    description: 'The world\'s first nuclear-powered aircraft carrier.',
    status: 'RETIRED',
    createdAt: new Date('1961-11-25'),
  },
  {
    id: '3',
    name: 'Queen Mary 2',
    type: 'Cruise Ship',
    length: 345.0,
    width: 45.0,
    height: 72.0,
    description: 'Transatlantic ocean liner and cruise ship.',
    status: 'ACTIVE',
    createdAt: new Date('2004-01-12'),
  },
  {
    id: '4',
    name: 'Ever Given',
    type: 'Container Ship',
    length: 400.0,
    width: 59.0,
    height: 32.9,
    description: 'Container ship that blocked the Suez Canal in 2021.',
    status: 'ACTIVE',
    createdAt: new Date('2018-07-01'),
  },
];

export default function EditShipPage() {
  const params = useParams();
  const router = useRouter();
  const [ship, setShip] = useState<Ship | null>(null);
  const [rows, setRows] = useState<RowShip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Simulate fetching ship data and its rows
    const shipId = params.id as string;
    const foundShip = sampleShips.find(s => s.id === shipId);

    // Sample row data for demonstration
    const sampleRows: RowShip[] = [
      {
        id: 'row-1',
        value1: 10.5,
        value2: 20.3,
        value3: 15.7,
        value4: 8.9,
        value5: 12.1,
        value6: 25.4,
        value7: 18.6,
        value8: 9.2,
        value9: 14.8,
        value10: 22.0,
        value11: 16.3,
        createdAt: new Date('2024-01-15'),
        shipId: shipId,
      },
      {
        id: 'row-2',
        value1: 11.2,
        value2: 19.8,
        value3: 16.1,
        value4: 9.3,
        value5: 13.5,
        value6: 24.9,
        value7: 17.2,
        value8: 10.6,
        value9: 15.4,
        value10: 21.7,
        value11: 17.8,
        createdAt: new Date('2024-01-20'),
        shipId: shipId,
      },
    ];

    setTimeout(() => {
      setShip(foundShip || null);
      setRows(foundShip ? sampleRows : []);
      setLoading(false);
    }, 300);
  }, [params.id]);

  const handleSubmit = async (data: ShipFormData) => {
    // Include rows in the form data
    const shipData = {
      ...data,
      rows: rows,
    };

    // Placeholder for backend integration - replace with actual Prisma update
    // e.g., await prisma.ship.update({ where: { id: params.id }, data: shipData });

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90% success rate for demo
            resolve('Ship updated successfully');
          } else {
            reject(new Error('Failed to update ship. Please try again.'));
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
      shipId: params.id as string,
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
      shipId: params.id as string,
    }));
    setRows([...rows, ...newRows]);
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading ship data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!ship) {
    return (
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ship Not Found</h1>
            <p className="text-gray-600 mb-6">The ship you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/ships')}>
              Back to Ships
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Ship</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Update the information for {ship.name}
            </p>
          </div>

        {/* Ship Form */}
        <ShipForm
          initialData={{
            name: ship.name,
            type: ship.type,
            length: ship.length,
            width: ship.width,
            height: ship.height,
            description: ship.description,
            status: ship.status,
          }}
          onSubmit={handleSubmit}
          isEditing={true}
        />

        {/* RowShip Table */}
        <Card className="max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Ship Data Rows</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Manage measurement data rows for {ship.name}
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
            <DialogDescription>Ship updated successfully.</DialogDescription>
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
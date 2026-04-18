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
import { Ship, ShipFormData, RowShip, RowShipFormData } from '@/types';


export default function EditShipPage() {
  const params = useParams();
  const router = useRouter();
  const [ship, setShip] = useState<Ship | null>(null);
  const [rows, setRows] = useState<RowShip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchShip = async () => {
      try {
        const res = await fetch(`/api/ships/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) setShip(null);
          throw new Error('Failed to fetch ship');
        }
        const data = await res.json();
        setShip(data);
        setRows(data.rows || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchShip();
  }, [params.id]);

  const handleSubmit = async (data: ShipFormData) => {
    const shipData = { ...data, rows };
    try {
      const res = await fetch(`/api/ships/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update ship');
      }
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

  // UUID v4 regex — rows loaded from the DB have real UUIDs;
  // rows added in the UI before saving have fake ids like "row-1234567890".
  const isRealDbId = (rowId: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rowId);

  const handleDeleteRow = async (id: string) => {
    if (isDeleting) return;           // prevent double-clicks

    if (isRealDbId(id)) {
      // Row exists in the DB → delete it immediately
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/rows/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to delete row');
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to delete row');
        setShowError(true);
        setIsDeleting(false);
        return;  // abort — do NOT remove from UI if DB delete failed
      }
      setIsDeleting(false);
    }

    // Remove from UI state (for both real and unsaved rows)
    setRows((prev) => prev.filter((row) => row.id !== id));
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
            <p className="text-gray-600 mb-6">The ship you&apos;re looking for doesn&apos;t exist.</p>
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
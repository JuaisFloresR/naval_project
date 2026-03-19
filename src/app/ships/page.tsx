'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ShipTable } from '@/components/ShipTable';
import { Button } from '@/components/ui/button';
import { Ship } from '@/types';



export default function ShipsPage() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShips = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/ships');
      if (!res.ok) throw new Error('Failed to fetch ships');
      const data = await res.json();
      setShips(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShips();
  }, []);

  const handleDeleteShip = async (id: string) => {
    try {
      const res = await fetch(`/api/ships/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ship');
      setShips(ships.filter(ship => ship.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="lg:text-3xl text-2xl font-bold text-gray-900">Ships Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your fleet and vessel information
              </p>
            </div>
            <Link href="/ships/create">
              <Button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add New Ship
              </Button>
            </Link>
          </div>
        </div>

        {/* Ships Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Ships ({ships.length})
            </h2>
          </div>
          <div className="p-6">
            <ShipTable data={ships} onDelete={handleDeleteShip} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
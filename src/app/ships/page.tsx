'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ShipTable } from '@/components/ShipTable';
import { Button } from '@/components/ui/button';
import { Ship } from '@/types';

// Sample ship data
const initialShips: Ship[] = [
  {
    id: '1',
    name: 'HMS Victory',
    type: 'Battleship',
    yearBuilt: 1765,
  },
  {
    id: '2',
    name: 'USS Enterprise',
    type: 'Aircraft Carrier',
    yearBuilt: 1961,
  },
  {
    id: '3',
    name: 'Queen Mary 2',
    type: 'Cruise Ship',
    yearBuilt: 2004,
  },
  {
    id: '4',
    name: 'Ever Given',
    type: 'Container Ship',
    yearBuilt: 2018,
  },
];

export default function ShipsPage() {
  const [ships, setShips] = useState<Ship[]>(initialShips);

  const handleDeleteShip = (id: string) => {
    setShips(ships.filter(ship => ship.id !== id));
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ships Management</h1>
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
            <ShipTable data={ships} onDelete={handleDeleteShip} />
          </div>
        </div>
      </div>
    </div>
  );
}
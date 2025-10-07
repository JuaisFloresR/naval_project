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
    length: 69.6,
    width: 16.2,
    height: 20.0,
    description: 'Historic British warship famous for the Battle of Trafalgar',
    status: 'RETIRED' as const,
    createdAt: new Date(1765, 0, 1),
    yearBuilt: 1765,
  },
  {
    id: '2',
    name: 'USS Enterprise',
    type: 'Aircraft Carrier',
    length: 342.0,
    width: 77.7,
    height: 37.0,
    description: 'Iconic US Navy aircraft carrier from the Cold War era',
    status: 'RETIRED' as const,
    createdAt: new Date(1961, 0, 1),
    yearBuilt: 1961,
  },
  {
    id: '3',
    name: 'Queen Mary 2',
    type: 'Cruise Ship',
    length: 345.0,
    width: 45.0,
    height: 72.0,
    description: 'Luxury transatlantic ocean liner operated by Cunard',
    status: 'ACTIVE' as const,
    createdAt: new Date(2004, 0, 1),
    yearBuilt: 2004,
  },
  {
    id: '4',
    name: 'Ever Given',
    type: 'Container Ship',
    length: 400.0,
    width: 59.0,
    height: 32.9,
    description: 'One of the largest container ships in the world',
    status: 'ACTIVE' as const,
    createdAt: new Date(2018, 0, 1),
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
            <ShipTable data={ships} onDelete={handleDeleteShip} />
          </div>
        </div>
      </div>
    </div>
  );
}
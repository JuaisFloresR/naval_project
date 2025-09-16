'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PartsTable } from '@/components/PartsTable';
import { Button } from '@/components/ui/button';
import { Part } from '@/types';

// Sample parts data
const initialParts: Part[] = [
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

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>(initialParts);

  const handleDeletePart = (id: string) => {
    setParts(parts.filter(part => part.id !== id));
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Parts Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your inventory of ship parts and components
              </p>
            </div>
            <Link href="/parts/create">
              <Button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add New Part
              </Button>
            </Link>
          </div>
        </div>

        {/* Parts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Parts ({parts.length})
            </h2>
          </div>
          <div className="p-6">
            <PartsTable data={parts} onDelete={handleDeletePart} />
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ShipForm from '@/components/ShipForm';
import { Button } from '@/components/ui/button';
import { Ship, ShipFormData } from '@/types';

// Sample ship data (same as in the list page)
const sampleShips: Ship[] = [
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

export default function EditShipPage() {
  const params = useParams();
  const router = useRouter();
  const [ship, setShip] = useState<Ship | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching ship data
    const shipId = params.id as string;
    const foundShip = sampleShips.find(s => s.id === shipId);
    
    setTimeout(() => {
      setShip(foundShip || null);
      setLoading(false);
    }, 300);
  }, [params.id]);

  const handleSubmit = (data: ShipFormData) => {
    // Placeholder for backend integration
    console.log('Updating ship:', { id: params.id, ...data });
    
    // Simulate API call delay
    setTimeout(() => {
      router.push('/ships');
    }, 500);
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
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Ship</h1>
          <p className="mt-2 text-gray-600">
            Update the information for {ship.name}
          </p>
        </div>

        {/* Ship Form */}
        <ShipForm
          initialData={{
            name: ship.name,
            type: ship.type,
            yearBuilt: ship.yearBuilt,
          }}
          onSubmit={handleSubmit}
          isEditing={true}
        />
      </div>
    </div>
  );
}
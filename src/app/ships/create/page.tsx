'use client';

import { useRouter } from 'next/navigation';
import ShipForm from '@/components/ShipForm';
import { ShipFormData } from '@/types';

export default function CreateShipPage() {
  const router = useRouter();

  const handleSubmit = (data: ShipFormData) => {
    // Placeholder for backend integration
    console.log('Creating ship:', data);

    // Simulate API call delay
    setTimeout(() => {
      router.push('/ships');
    }, 500);
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Ship</h1>
          <p className="mt-2 text-gray-600">
            Create a new ship entry in your fleet
          </p>
        </div>

        {/* Ship Form */}
        <ShipForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
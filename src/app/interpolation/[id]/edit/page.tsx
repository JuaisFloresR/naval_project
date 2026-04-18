'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import InterpolationForm from '@/components/interpolation/InterpolationForm';
import { Interpolation } from '@/types';

export default function EditInterpolationPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Interpolation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/interpolation/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || 'Interpolation not found');
        }
        return res.json() as Promise<Interpolation>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-sm">Loading interpolation data…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-lg font-semibold text-gray-800">Failed to load record</p>
          <p className="text-sm text-gray-500">{error ?? 'Record not found.'}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return <InterpolationForm initialData={data} />;
}

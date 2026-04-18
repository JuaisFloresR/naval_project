'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, Anchor, CalendarDays, Layers, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Interpolation } from '@/types';

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function StatusBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
      <Layers className="h-3 w-3" />
      {count} {count === 1 ? 'row' : 'rows'}
    </span>
  );
}

export default function InterpolationPage() {
  const [interpolations, setInterpolations] = useState<Interpolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterpolations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/interpolation');
      if (!res.ok) throw new Error('Failed to fetch interpolations');
      const data = await res.json();
      setInterpolations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterpolations();
  }, []);

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="lg:text-3xl text-2xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                Interpolation
              </h1>
              <p className="mt-2 text-gray-600">
                Manage hydrostatic interpolation records linked to your fleet
              </p>
            </div>
            <Link href="/interpolation/create">
              <Button
                id="btn-new-interpolation"
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Interpolation
              </Button>
            </Link>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Interpolations ({interpolations.length})
            </h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              /* Loading skeleton */
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : interpolations.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No interpolations yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                  Create your first interpolation record by selecting a ship and providing hydrostatic data.
                </p>
                <Link href="/interpolation/create">
                  <Button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    New Interpolation
                  </Button>
                </Link>
              </div>
            ) : (
              /* Data table */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        #&nbsp;ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Anchor className="h-3.5 w-3.5" />
                          Ship
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Created
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Detail Rows
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {interpolations.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {/* ID cell — show short UUID suffix */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-mono text-gray-400">
                            #{(index + 1).toString().padStart(3, '0')}
                          </span>
                          <span className="ml-2 text-xs text-gray-300 font-mono hidden sm:inline">
                            {item.id.slice(-8)}
                          </span>
                        </td>

                        {/* Ship name */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Anchor className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {item.ship?.name ?? '—'}
                            </span>
                          </div>
                        </td>

                        {/* Created date */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(item.createdAt)}
                        </td>

                        {/* Detail count */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge count={item._count?.details ?? 0} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link
                            href={`/interpolation/${item.id}`}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

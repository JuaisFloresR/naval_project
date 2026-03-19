'use client';

import { Ship } from '@/types';
import { Badge } from '@/components/ui/badge';
import { EntityTable, EntityColumnConfig, MobileFieldConfig } from './EntityTable';

interface ShipTableProps {
  data: Ship[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

// Helper function for type badge colors
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Battleship': 'bg-red-100 text-red-800',
    'Aircraft Carrier': 'bg-blue-100 text-blue-800',
    'Cruise Ship': 'bg-green-100 text-green-800',
    'Container Ship': 'bg-yellow-100 text-yellow-800',
    'Destroyer': 'bg-purple-100 text-purple-800',
    'Submarine': 'bg-gray-100 text-gray-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

// Column configuration
const columns: EntityColumnConfig<Ship>[] = [
  { 
    key: 'id', 
    header: 'ID',
    className: 'font-mono text-sm',
    sortable: true
  },
  { 
    key: 'name', 
    header: 'Name',
    className: 'font-medium',
    sortable: true
  },
  { 
    key: 'type', 
    header: 'Type',
    render: (ship) => (
      <Badge className={getTypeColor(ship.type)} variant="secondary">
        {ship.type}
      </Badge>
    ),
    sortable: true
  },
  { 
    key: 'status', 
    header: 'Status',
    render: (ship) => {
      const colors: Record<string, string> = {
        'ACTIVE': 'bg-green-100 text-green-800',
        'INACTIVE': 'bg-gray-100 text-gray-800',
        'RETIRED': 'bg-red-100 text-red-800',
        'UNDER_REPAIR': 'bg-yellow-100 text-yellow-800',
      };
      return (
        <Badge className={colors[ship.status] || 'bg-gray-100 text-gray-800'} variant="secondary">
          {ship.status.replace('_', ' ')}
        </Badge>
      );
    },
    sortable: true
  },
];

// Mobile field configuration
const mobileFields: MobileFieldConfig<Ship>[] = [
  {
    label: 'Type',
    render: (ship) => (
      <Badge className={getTypeColor(ship.type)} variant="secondary">
        {ship.type}
      </Badge>
    )
  },
  {
    label: 'Status',
    render: (ship) => ship.status.replace('_', ' ')
  },
];

export function ShipTable({ data, onDelete, isLoading }: ShipTableProps) {
  return (
    <EntityTable<Ship>
      data={data}
      columns={columns}
      mobileFields={mobileFields}
      getEntityName={(ship) => ship.name}
      editBasePath="/ships"
      entityTypeName="Ship"
      emptyMessage="No ships found. Add some ships to get started!"
      isLoading={isLoading}
      searchPlaceholder="Search ships by name or type..."
      onDelete={onDelete}
    />
  );
}
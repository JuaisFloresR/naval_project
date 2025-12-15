'use client';

import { Ship } from '@/types';
import { Badge } from '@/components/ui/badge';
import { EntityTable, EntityColumnConfig, MobileFieldConfig } from './EntityTable';

interface ShipTableProps {
  data: Ship[];
  onDelete: (id: string) => void;
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
    className: 'font-mono text-sm'
  },
  { 
    key: 'name', 
    header: 'Name',
    className: 'font-medium'
  },
  { 
    key: 'type', 
    header: 'Type',
    render: (ship) => (
      <Badge className={getTypeColor(ship.type)} variant="secondary">
        {ship.type}
      </Badge>
    )
  },
  { 
    key: 'yearBuilt', 
    header: 'Year Built'
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
    label: 'Year Built',
    render: (ship) => ship.yearBuilt?.toString() || 'N/A'
  },
];

export function ShipTable({ data, onDelete }: ShipTableProps) {
  return (
    <EntityTable<Ship>
      data={data}
      columns={columns}
      mobileFields={mobileFields}
      getEntityName={(ship) => ship.name}
      editBasePath="/ships"
      entityTypeName="Ship"
      emptyMessage="No ships found. Add some ships to get started!"
      onDelete={onDelete}
    />
  );
}
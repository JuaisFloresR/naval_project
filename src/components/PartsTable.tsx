'use client';

import { Part } from '@/types';
import { EntityTable, EntityColumnConfig, MobileFieldConfig } from './EntityTable';

// Sample ships for lookup (mirroring Ships sample data)
const sampleShips = [
  { id: '1', name: 'HMS Victory', type: 'Battleship' },
  { id: '2', name: 'USS Enterprise', type: 'Aircraft Carrier' },
  { id: '3', name: 'Queen Mary 2', type: 'Cruise Ship' },
  { id: '4', name: 'Ever Given', type: 'Container Ship' },
];

interface PartsTableProps {
  data: Part[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

// Function to get ship name by shipId
const getShipName = (shipId: string): string => {
  const ship = sampleShips.find(s => s.id === shipId);
  return ship ? ship.name : 'Unknown Ship';
};

// Column configuration
const columns: EntityColumnConfig<Part>[] = [
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
    key: 'description', 
    header: 'Description',
    className: 'text-sm max-w-xs truncate',
    sortable: true
  },
  { 
    key: 'shipId', 
    header: 'Ship',
    render: (part) => getShipName(part.shipId),
    getSearchText: (part) => getShipName(part.shipId), // Makes ship name searchable!
    sortable: true
  },
];

// Mobile field configuration
const mobileFields: MobileFieldConfig<Part>[] = [
  {
    label: 'Description',
    render: (part) => part.description
  },
  {
    label: 'Ship',
    render: (part) => getShipName(part.shipId)
  },
];

export function PartsTable({ data, onDelete, isLoading }: PartsTableProps) {
  return (
    <EntityTable<Part>
      data={data}
      columns={columns}
      mobileFields={mobileFields}
      getEntityName={(part) => part.name}
      editBasePath="/parts"
      entityTypeName="Part"
      emptyMessage="No parts found. Add some parts to get started!"
      isLoading={isLoading}
      searchPlaceholder="Search parts by name, description, or ship..."
      onDelete={onDelete}
    />
  );
}
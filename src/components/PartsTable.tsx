'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Part } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

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
}

export function PartsTable({ data, onDelete }: PartsTableProps) {
  const [deletePartId, setDeletePartId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (deletePartId) {
      onDelete(deletePartId);
      setDeletePartId(null);
    }
  };

  // Function to get ship name by shipId
  const getShipName = (shipId: string) => {
    const ship = sampleShips.find(s => s.id === shipId);
    return ship ? ship.name : 'Unknown Ship';
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900">ID</TableHead>
                <TableHead className="font-semibold text-gray-900">Name</TableHead>
                <TableHead className="font-semibold text-gray-900">Description</TableHead>
                <TableHead className="font-semibold text-gray-900">Ship</TableHead>
                <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((part) => (
                <TableRow key={part.id} className="hover:bg-gray-50 border-b">
                  <TableCell className="font-mono text-sm">{part.id}</TableCell>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{part.description}</TableCell>
                  <TableCell>{getShipName(part.shipId)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/parts/edit/${part.id}`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletePartId(part.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((part) => (
          <div 
            key={part.id} 
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{part.name}</h3>
                <p className="text-sm text-gray-500 font-mono">ID: {part.id}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/parts/edit/${part.id}`} className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeletePartId(part.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Description:</span>
                <span className="text-sm font-medium max-w-xs truncate">{part.description}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ship:</span>
                <span className="text-sm font-medium">{getShipName(part.shipId)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No parts found. Add some parts to get started!</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePartId} onOpenChange={() => setDeletePartId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the part
              and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Part
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
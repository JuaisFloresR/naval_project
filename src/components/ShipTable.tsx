'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ship } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

interface ShipTableProps {
  data: Ship[];
  onDelete: (id: string) => void;
}

export function ShipTable({ data, onDelete }: ShipTableProps) {
  const [deleteShipId, setDeleteShipId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteShipId) {
      onDelete(deleteShipId);
      setDeleteShipId(null);
    }
  };

  const getTypeColor = (type: string) => {
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
                <TableHead className="font-semibold text-gray-900">Type</TableHead>
                <TableHead className="font-semibold text-gray-900">Year Built</TableHead>
                <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((ship) => (
                <TableRow key={ship.id} className="hover:bg-gray-50 border-b">
                  <TableCell className="font-mono text-sm">{ship.id}</TableCell>
                  <TableCell className="font-medium">{ship.name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(ship.type)} variant="secondary">
                      {ship.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{ship.yearBuilt}</TableCell>
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
                          <Link href={`/ships/edit/${ship.id}`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteShipId(ship.id)}
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
        {data.map((ship) => (
          <div 
            key={ship.id} 
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{ship.name}</h3>
                <p className="text-sm text-gray-500 font-mono">ID: {ship.id}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/ships/edit/${ship.id}`} className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeleteShipId(ship.id)}
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
                <span className="text-sm text-gray-600">Type:</span>
                <Badge className={getTypeColor(ship.type)} variant="secondary">
                  {ship.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Year Built:</span>
                <span className="text-sm font-medium">{ship.yearBuilt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No ships found. Add some ships to get started!</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteShipId} onOpenChange={() => setDeleteShipId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ship
              and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Ship
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
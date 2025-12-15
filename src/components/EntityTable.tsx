'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
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

// Column configuration for entity tables
export interface EntityColumnConfig<T> {
  key: keyof T | string;
  header: string;
  /** Custom cell renderer. If not provided, displays the value directly */
  render?: (row: T) => ReactNode;
  /** CSS classes for the cell */
  className?: string;
}

// Configuration for mobile card fields
export interface MobileFieldConfig<T> {
  label: string;
  render: (row: T) => ReactNode;
}

export interface EntityTableProps<T extends { id: string }> {
  data: T[];
  columns: EntityColumnConfig<T>[];
  mobileFields: MobileFieldConfig<T>[];
  /** Function to get the entity name for display in the mobile card header */
  getEntityName: (row: T) => string;
  /** Base path for edit links (e.g., '/ships' will create '/ships/edit/{id}') */
  editBasePath: string;
  /** Entity type name for delete confirmation message */
  entityTypeName: string;
  /** Empty state message */
  emptyMessage: string;
  onDelete: (id: string) => void;
}

export function EntityTable<T extends { id: string }>({
  data,
  columns,
  mobileFields,
  getEntityName,
  editBasePath,
  entityTypeName,
  emptyMessage,
  onDelete,
}: EntityTableProps<T>) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const renderCellValue = (row: T, column: EntityColumnConfig<T>): ReactNode => {
    if (column.render) {
      return column.render(row);
    }
    const value = (row as Record<string, unknown>)[column.key as string];
    return value !== undefined && value !== null ? String(value) : '';
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column) => (
                  <TableHead 
                    key={String(column.key)} 
                    className={`font-semibold text-gray-900 ${column.className || ''}`}
                  >
                    {column.header}
                  </TableHead>
                ))}
                <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50 border-b">
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className={column.className}>
                      {renderCellValue(row, column)}
                    </TableCell>
                  ))}
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
                          <Link href={`${editBasePath}/edit/${row.id}`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(row.id)}
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
        {data.map((row) => (
          <div 
            key={row.id} 
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{getEntityName(row)}</h3>
                <p className="text-sm text-gray-500 font-mono">ID: {row.id}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`${editBasePath}/edit/${row.id}`} className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeleteId(row.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-2">
              {mobileFields.map((field, index) => (
                <div key={index} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-600 flex-shrink-0">{field.label}:</span>
                  <span className="text-sm font-medium text-right truncate max-w-[60%]">{field.render(row)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {entityTypeName.toLowerCase()}
              and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {entityTypeName}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

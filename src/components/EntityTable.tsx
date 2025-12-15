'use client';

import { useState, useMemo, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { MoreHorizontal, Edit, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';

// Column configuration for entity tables
export interface EntityColumnConfig<T> {
  key: keyof T | string;
  header: string;
  /** Custom cell renderer. If not provided, displays the value directly */
  render?: (row: T) => ReactNode;
  /** CSS classes for the cell */
  className?: string;
  /** Enable sorting for this column (default: true) */
  sortable?: boolean;
  /** Custom function to get searchable text from this column */
  getSearchText?: (row: T) => string;
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
  /** Show loading skeleton */
  isLoading?: boolean;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  onDelete: (id: string) => void;
}

type SortField = string | null;
type SortDirection = 'asc' | 'desc' | null;

export function EntityTable<T extends { id: string }>({
  data,
  columns,
  mobileFields,
  getEntityName,
  editBasePath,
  entityTypeName,
  emptyMessage,
  isLoading = false,
  searchPlaceholder = 'Search...',
  onDelete,
}: EntityTableProps<T>) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleSort = (columnKey: string, sortable: boolean = true) => {
    if (!sortable) return;

    if (sortField === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(columnKey);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (columnKey: string, sortable: boolean = true) => {
    if (!sortable) return null;
    if (sortField !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    if (sortDirection === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  // Get searchable text for a column
  const getColumnSearchText = (row: T, column: EntityColumnConfig<T>): string => {
    if (column.getSearchText) {
      return column.getSearchText(row);
    }
    
    if (column.render) {
      // For rendered columns, try to extract text from the ReactNode
      const rendered = column.render(row);
      if (typeof rendered === 'string') return rendered;
      if (typeof rendered === 'number') return String(rendered);
      // For complex renders (like badges), fall back to the raw value
      const value = (row as Record<string, unknown>)[column.key as string];
      return value !== null && value !== undefined ? String(value) : '';
    }
    
    const value = (row as Record<string, unknown>)[column.key as string];
    return value !== null && value !== undefined ? String(value) : '';
  };

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search filter across ALL columns
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(row => {
        return columns.some(column => {
          const searchText = getColumnSearchText(row, column);
          return searchText.toLowerCase().includes(lowerSearch);
        });
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const column = columns.find(col => String(col.key) === sortField);
        if (!column) return 0;

        // Use search text for comparison (includes rendered values)
        const aText = getColumnSearchText(a, column);
        const bText = getColumnSearchText(b, column);

        // Try numeric comparison first
        const aNum = parseFloat(aText);
        const bNum = parseFloat(bText);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Fall back to string comparison
        return sortDirection === 'asc'
          ? aText.localeCompare(bText)
          : bText.localeCompare(aText);
      });
    }

    return result;
  }, [data, searchTerm, sortField, sortDirection, columns]);

  const renderCellValue = (row: T, column: EntityColumnConfig<T>): ReactNode => {
    if (column.render) {
      return column.render(row);
    }
    const value = (row as Record<string, unknown>)[column.key as string];
    return value !== undefined && value !== null ? String(value) : '';
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {/* Search skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>

        {/* Desktop table skeleton */}
        <div className="hidden md:block">
          <div className="rounded-md border overflow-hidden">
            <div className="bg-gray-50 p-4">
              <div className="flex gap-4">
                {columns.map((col, i) => (
                  <Skeleton key={i} className="h-5 flex-1" />
                ))}
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  {columns.map((col, j) => (
                    <Skeleton key={j} className="h-12 flex-1" />
                  ))}
                  <Skeleton className="h-12 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile cards skeleton */}
        <div className="md:hidden space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between mb-3">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchTerm && (
          <span className="text-sm text-gray-500">
            {processedData.length} result{processedData.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

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
                    {column.sortable !== false ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(String(column.key), column.sortable !== false)}
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent -ml-4"
                      >
                        {column.header}
                        {getSortIcon(String(column.key), column.sortable !== false)}
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
                <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50 border-b transition-colors">
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
        {processedData.map((row) => (
          <div 
            key={row.id} 
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
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

      {processedData.length === 0 && !isLoading && (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-muted-foreground">
            {searchTerm ? (
              <>
                No results found for <span className="font-semibold">&quot;{searchTerm}&quot;</span>
              </>
            ) : (
              emptyMessage
            )}
          </p>
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

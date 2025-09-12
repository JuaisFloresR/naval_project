'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShipFormData } from '@/types';

interface ShipFormProps {
  initialData?: ShipFormData;
  onSubmit: (data: ShipFormData) => void;
  isEditing?: boolean;
}

export default function ShipForm({ initialData, onSubmit, isEditing = false }: ShipFormProps) {
  const shipSchema = z.object({
    name: z.string().min(1, 'Ship name is required'),
    type: z.string().min(1, 'Ship type is required'),
    length: z.coerce.number().min(0.01, 'Length must be greater than 0'),
    width: z.coerce.number().min(0.01, 'Width must be greater than 0'),
    height: z.coerce.number().min(0.01, 'Height must be greater than 0'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    status: z.enum(['ACTIVE', 'RETIRED', 'UNDER_REPAIR']).optional(),
  }).refine((data) => !isEditing || data.status !== undefined, {
    message: 'Status is required when editing',
    path: ['status'],
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ShipFormData>({
    resolver: zodResolver(shipSchema),
    defaultValues: initialData || {
      name: '',
      type: '',
      length: 0,
      width: 0,
      height: 0,
      description: '',
      status: isEditing ? 'ACTIVE' : undefined,
    },
  });

  const statusValue = watch('status');

  const onFormSubmit = (data: ShipFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="px-4 py-6 sm:px-6">
        <CardTitle className="text-lg sm:text-xl font-semibold">
          {isEditing ? 'Edit Ship' : 'Add New Ship'}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-6 sm:px-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 sm:space-y-6 md:grid md:grid-cols-2 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Ship Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter ship name"
              {...register('name')}
              className="h-11 sm:h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Ship Type <span className="text-red-500">*</span>
            </Label>
            <Input
              id="type"
              type="text"
              placeholder="e.g., Battleship, Cruise Ship, Container Ship"
              aria-required="true"
              {...register('type')}
              className="h-11 sm:h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
            {errors.type && (
              <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="length" className="text-sm font-medium text-gray-700">
              Length (m) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="length"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter length in meters"
              aria-required="true"
              {...register('length', { valueAsNumber: true })}
              className="h-11 sm:h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
            {errors.length && (
              <p className="text-sm text-red-600 mt-1">{errors.length.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="width" className="text-sm font-medium text-gray-700">
              Width (m) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="width"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter width in meters"
              aria-required="true"
              {...register('width', { valueAsNumber: true })}
              className="h-11 sm:h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
            {errors.width && (
              <p className="text-sm text-red-600 mt-1">{errors.width.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm font-medium text-gray-700">
              Height (m) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="height"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter height in meters"
              aria-required="true"
              {...register('height', { valueAsNumber: true })}
              className="h-11 sm:h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
            {errors.height && (
              <p className="text-sm text-red-600 mt-1">{errors.height.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <textarea
              id="description"
              placeholder="Enter ship description..."
              {...register('description')}
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select value={statusValue} onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger className="h-11 sm:h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                  <SelectItem value="UNDER_REPAIR">Under Repair</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 md:col-span-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 sm:h-10 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-base font-medium flex items-center gap-2"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Ship')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="h-11 sm:h-10 border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-base font-medium"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
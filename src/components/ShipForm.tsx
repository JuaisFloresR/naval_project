'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShipFormData } from '@/types';

const shipSchema = z.object({
  name: z.string().min(1, 'Ship name is required'),
  type: z.string().min(1, 'Ship type is required'),
  yearBuilt: z.number().min(1800, 'Year must be after 1800').max(new Date().getFullYear(), 'Year cannot be in the future'),
});

interface ShipFormProps {
  initialData?: ShipFormData;
  onSubmit: (data: ShipFormData) => void;
  isEditing?: boolean;
}

export default function ShipForm({ initialData, onSubmit, isEditing = false }: ShipFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShipFormData>({
    resolver: zodResolver(shipSchema),
    defaultValues: initialData || {
      name: '',
      type: '',
      yearBuilt: new Date().getFullYear(),
    },
  });

  const onFormSubmit = (data: ShipFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {isEditing ? 'Edit Ship' : 'Add New Ship'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Ship Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter ship name"
              {...register('name')}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Ship Type</Label>
            <Input
              id="type"
              type="text"
              placeholder="e.g., Battleship, Cruise Ship, Container Ship"
              {...register('type')}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearBuilt">Year Built</Label>
            <Input
              id="yearBuilt"
              type="number"
              placeholder="Enter year built"
              {...register('yearBuilt', { valueAsNumber: true })}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            {errors.yearBuilt && (
              <p className="text-sm text-destructive">{errors.yearBuilt.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Ship')}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
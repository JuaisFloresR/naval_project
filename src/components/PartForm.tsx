'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PartFormData } from '@/types';

// Sample ships for the select dropdown (mirroring Ships sample data)
const sampleShips = [
  { id: '1', name: 'HMS Victory' },
  { id: '2', name: 'USS Enterprise' },
  { id: '3', name: 'Queen Mary 2' },
  { id: '4', name: 'Ever Given' },
];

interface PartFormProps {
  initialData?: PartFormData;
  onSubmit: (data: PartFormData) => void;
  isEditing?: boolean;
}

export default function PartForm({ initialData, onSubmit, isEditing = false }: PartFormProps) {
  const partSchema = z.object({
    name: z.string().min(1, 'Part name is required'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    shipId: z.string().min(1, 'Ship is required'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      shipId: '',
    },
  });

  const onFormSubmit = (data: PartFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="px-4 py-6 sm:px-6">
        <CardTitle className="text-lg sm:text-xl font-semibold">
          {isEditing ? 'Edit Part' : 'Add New Part'}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-6 sm:px-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Part Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter part name"
              {...register('name')}
              className="h-11 sm:h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <textarea
              id="description"
              placeholder="Enter part description..."
              {...register('description')}
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipId" className="text-sm font-medium text-gray-700">
              Associated Ship <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => setValue('shipId', value)} defaultValue={initialData?.shipId || ''}>
              <SelectTrigger className="h-11 sm:h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-gray-300">
                <SelectValue placeholder="Select a ship" />
              </SelectTrigger>
              <SelectContent>
                {sampleShips.map((ship) => (
                  <SelectItem key={ship.id} value={ship.id}>
                    {ship.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.shipId && (
              <p className="text-sm text-red-600 mt-1">{errors.shipId.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 sm:h-10 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-base font-medium flex items-center gap-2"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Part')}
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
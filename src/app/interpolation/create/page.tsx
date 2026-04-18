import InterpolationForm from '@/components/interpolation/InterpolationForm';

export const metadata = {
  title: 'New Interpolation | Naval Project',
  description: 'Create a new hydrostatic interpolation record for a ship.',
};

export default function CreateInterpolationPage() {
  return <InterpolationForm />;
}

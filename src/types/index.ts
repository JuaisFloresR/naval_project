export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  department: string;
}

export interface FormData {
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface Ship {
  id: string;
  name: string;
  type: string;
  yearBuilt: number;
}

export interface ShipFormData {
  name: string;
  type: string;
  yearBuilt: number;
}
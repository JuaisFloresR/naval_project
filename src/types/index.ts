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
  rows?: RowShip[];
}

export interface RowShip {
  id: string;
  value1: number;
  value2: number;
  value3: number;
  value4: number;
  value5: number;
  value6: number;
  value7: number;
  value8: number;
  value9: number;
  value10: number;
  value11: number;
  createdAt: Date;
  shipId?: string;
}

export interface RowShipFormData {
  value1: number;
  value2: number;
  value3: number;
  value4: number;
  value5: number;
  value6: number;
  value7: number;
  value8: number;
  value9: number;
  value10: number;
  value11: number;
}
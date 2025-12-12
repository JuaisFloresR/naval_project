// Existing content
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
  length: number;
  width: number;
  height: number;
  description: string;
  status: 'ACTIVE' | 'RETIRED' | 'UNDER_REPAIR';
  createdAt: Date;
  yearBuilt?: number; 
}

export type ShipStatus = 'ACTIVE' | 'RETIRED' | 'UNDER_REPAIR';

export interface ShipFormData {
  name: string;
  type: string;
  length: number;
  width: number;
  height: number;
  description?: string;
  status?: ShipStatus;
  yearBuilt?: number;
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
  [key: string]: number;
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

// New types for Part
export interface Part {
  id: string;
  name: string;
  description: string;
  shipId: string;
  createdAt?: Date;
}

export interface PartFormData {
  name: string;
  description?: string;
  shipId: string;
  rows?: RowPart[];
}

export interface RowPart {
  id: string;
  value1: number;
  value2: number;
  value3: number;
  value4: number;
  value5: number;
  value6: number;
  value7: number;
  createdAt: Date;
  partId?: string;
}

export interface RowPartFormData {
  [key: string]: number;
  value1: number;
  value2: number;
  value3: number;
  value4: number;
  value5: number;
  value6: number;
  value7: number;
}
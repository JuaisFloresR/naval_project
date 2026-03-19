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
  status: 'ACTIVE' | 'INACTIVE' | 'RETIRED' | 'UNDER_REPAIR';
  createdAt: Date;
}

export type ShipStatus = 'ACTIVE' | 'INACTIVE' | 'RETIRED' | 'UNDER_REPAIR';

export interface ShipFormData {
  name: string;
  type: string;
  length: number;
  width: number;
  height: number;
  description?: string;
  status?: ShipStatus;
  rows?: RowShip[];
}

export interface RowShip {
  id: string;
  draft: number;        // (m)
  displacement: number; // (TM)
  wl_length: number;    // (m)
  wl_beam: number;      // (m)
  wetted_area: number;  // (m²)
  waterpl_area: number; // (m²)
  cp: number;           // (-)
  cb: number;           // (-)
  cm: number;           // (-)
  cwp: number;          // (-)
  lcb: number;          // (m)
  lcf: number;          // (m)
  kb: number;           // (m)
  bmt: number;          // (m)
  bml: number;          // (m)
  gmt: number;          // (m)
  gml: number;          // (m)
  kmt: number;          // (m)
  kml: number;          // (m)
  tpc: number;          // (TM/cm)
  mtc: number;          // (TM·m)
  rm_at_1deg: number;   // (TM·m)
  createdAt: Date;
  shipId?: string;
}

export interface RowShipFormData {
  [key: string]: number;
  draft: number;
  displacement: number;
  wl_length: number;
  wl_beam: number;
  wetted_area: number;
  waterpl_area: number;
  cp: number;
  cb: number;
  cm: number;
  cwp: number;
  lcb: number;
  lcf: number;
  kb: number;
  bmt: number;
  bml: number;
  gmt: number;
  gml: number;
  kmt: number;
  kml: number;
  tpc: number;
  mtc: number;
  rm_at_1deg: number;
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
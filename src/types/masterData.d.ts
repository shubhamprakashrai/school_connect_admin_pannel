/** Master-data DTOs — tenant-scoped lookup tables. */

export interface MasterDataResponse {
  id: string;
  category: string;
  value: string;
  label: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CreateMasterDataRequest {
  category: string;
  value: string;
  label: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateMasterDataRequest {
  label?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

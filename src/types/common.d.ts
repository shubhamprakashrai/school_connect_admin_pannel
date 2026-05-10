/**
 * Common DTOs reused across modules — `com.schoolmgmt.dto.common.*`.
 */

export interface ParentInfoDto {
  id?: string;
  name: string;
  occupation?: string;
  phone?: string;
  email?: string;
  parentType?: string; // FATHER | MOTHER | GUARDIAN
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface MedicalInfo {
  medicalConditions?: string;
  allergies?: string;
  emergencyMedication?: string;
  doctorName?: string;
  doctorPhone?: string;
}

export interface BankDetails {
  bankName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  ifscCode?: string;
}

export interface UserRequestDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  tenantId?: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'TRANSFERRED';

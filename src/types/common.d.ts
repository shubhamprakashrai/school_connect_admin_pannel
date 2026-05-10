/**
 * Common DTOs reused across modules — `com.schoolmgmt.dto.common.*`.
 */

/**
 * Legacy flat parent shape — kept temporarily for any module that still
 * references it. New code must use FatherInfo / MotherInfo / GuardianInfo
 * (or the wrapped {@link ComprehensiveParentInfo}) per backend.
 */
export interface ParentInfoDto {
  id?: string;
  name: string;
  occupation?: string;
  phone?: string;
  email?: string;
  parentType?: string;
}

/** `com.schoolmgmt.dto.common.FatherInfo` — name + occupation, both required if set. */
export interface FatherInfo {
  name: string;
  occupation: string;
}

/** `com.schoolmgmt.dto.common.MotherInfo` — name + occupation, both required if set. */
export interface MotherInfo {
  name: string;
  occupation: string;
}

/**
 * `com.schoolmgmt.dto.common.GuardianInfo` — also carries email + phone for
 * portal access. ALL FOUR fields are `@NotBlank` on the backend if guardianInfo
 * is provided; phone matches `^[+]?[0-9]{10,15}$`, email must be valid.
 */
export interface GuardianInfo {
  name: string;
  occupation: string;
  email: string;
  phone: string;
}

/**
 * `com.schoolmgmt.dto.common.ComprehensiveParentInfo` — wrapper required on
 * student create. The wrapper itself is `@NotNull`; its three inner fields
 * (father / mother / guardian) are individually optional but trigger nested
 * validation when present.
 */
export interface ComprehensiveParentInfo {
  fatherInfo?: FatherInfo;
  motherInfo?: MotherInfo;
  guardianInfo?: GuardianInfo;
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

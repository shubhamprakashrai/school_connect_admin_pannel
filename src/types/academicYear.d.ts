/** AcademicYear DTOs — `com.schoolmgmt.dto.{request,response}` */

export interface AcademicYearResponse {
  id: string;
  name: string;
  startDate: string; // ISO date
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicYearRequest {
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

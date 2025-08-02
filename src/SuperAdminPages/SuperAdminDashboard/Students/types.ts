export interface Student {
  id: string;
  name: string;
  rollNo: number;
  class: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  admissionDate: string;
  address: string;
  status: 'Active' | 'Inactive';
  transportOpted: boolean;
  hostelOpted: boolean;
  tags?: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface StudentFormData extends Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> {
  profilePicture?: File | null;
}

export interface StudentFilters {
  searchTerm?: string;
  class?: string;
  section?: string;
  gender?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedStudentResponse {
  data: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

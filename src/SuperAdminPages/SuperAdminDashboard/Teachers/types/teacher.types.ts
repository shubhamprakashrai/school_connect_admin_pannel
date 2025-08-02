export interface Teacher {
  id: string;
  teacherId: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  qualification: string;
  experience: number;
  specialization: string[];
  assignedClasses: string[];
  joiningDate: string;
  address: string;
  isClassTeacher: boolean;
  transportAssigned: boolean;
  hostelAssigned: boolean;
  status: 'Active' | 'Inactive';
  profilePhoto?: string;
  documents?: Array<{
    id: string;
    name: string;
    type: 'resume' | 'certificate' | 'other';
    url: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherFormData extends Omit<Teacher, 'id' | 'createdAt' | 'updatedAt' | 'documents' | 'teacherId'> {
  profilePhotoFile?: File;
  documentFiles?: File[];
  password?: string;
  confirmPassword?: string;
}

export interface TeacherFilterOptions {
  searchTerm?: string;
  status?: 'Active' | 'Inactive';
  experienceMin?: number;
  experienceMax?: number;
  specialization?: string[];
  assignedClass?: string[];
  sortBy?: 'name' | 'joiningDate' | 'experience';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TeacherListResponse {
  data: Teacher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

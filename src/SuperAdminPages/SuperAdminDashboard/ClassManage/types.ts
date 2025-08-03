export interface ClassSection {
  id: string;
  name: string;
  classTeacher?: {
    id: string;
    name: string;
  };
  maxStudents?: number;
  studentCount?: number;
}

export interface ClassData {
  id: string;
  className: string;
  sections: ClassSection[];
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface TeacherOption {
  id: string;
  name: string;
  email: string;
}

export interface ClassFormData {
  className: string;
  sections: {
    name: string;
    classTeacherId?: string;
    maxStudents?: number;
  }[];
  status: 'Active' | 'Inactive';
}

export interface ClassListFilters {
  status?: 'Active' | 'Inactive' | '';
  classTeacherId?: string;
  searchQuery?: string;
}

export enum ExamStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
}

export enum ExamType {
  MIDTERM = 'Midterm',
  FINAL = 'Final',
  UNIT_TEST = 'Unit Test',
  QUIZ = 'Quiz',
  ASSIGNMENT = 'Assignment',
  PRACTICAL = 'Practical',
  OTHER = 'Other',
}

export interface Class {
  id: string;
  name: string;
  level: string;
  section?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string; // Reference to Class
}

export interface ExamSchedule {
  id: string;
  examId: string; // Reference to Exam
  date: string; // ISO date string
  startTime: string; // ISO time string
  endTime: string; // ISO time string
  venue?: string;
  supervisor?: string;
}

export interface Exam {
  id: string;
  name: string;
  classId: string; // Reference to Class
  subjectId: string; // Reference to Subject
  examType: ExamType;
  totalMarks: number;
  passingMarks: number;
  description?: string;
  status: ExamStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  schedule: Omit<ExamSchedule, 'examId'>; // Embedded schedule
}

// For form data
export interface ExamFormData extends Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'status'> {
  id?: string; // Optional for edit mode
}

// For API responses
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// For table sorting and filtering
export interface ExamFilterOptions {
  searchTerm?: string;
  classId?: string;
  subjectId?: string;
  examType?: ExamType | '';
  status?: ExamStatus | '';
  dateRange?: {
    start: string;
    end: string;
  };
}

// For pagination
export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: keyof Exam;
  sortOrder?: 'asc' | 'desc';
}

// For the data grid
export interface ExamTableRow extends Omit<Exam, 'schedule' | 'classId' | 'subjectId'> {
  className: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
}

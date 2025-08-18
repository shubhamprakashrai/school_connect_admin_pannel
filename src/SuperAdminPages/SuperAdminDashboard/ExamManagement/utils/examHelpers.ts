import { Exam, ExamFilterOptions, ExamStatus, ExamType, PaginationOptions } from '../types/exam.types';

// Format date to display in UI
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format time to 12-hour format
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Get exam status based on current date and time
export const getExamStatus = (exam: Exam): ExamStatus => {
  const now = new Date();
  const examDate = new Date(exam.schedule.date);
  const startTime = new Date(`${exam.schedule.date}T${exam.schedule.startTime}`);
  const endTime = new Date(`${exam.schedule.date}T${exam.schedule.endTime}`);
  
  if (now < startTime) {
    return ExamStatus.UPCOMING;
  } else if (now >= startTime && now <= endTime) {
    return ExamStatus.ONGOING;
  } else {
    return ExamStatus.COMPLETED;
  }
};

// Filter exams based on filter options
export const filterExams = (
  exams: Exam[], 
  filters: ExamFilterOptions = {}
): Exam[] => {
  return exams.filter(exam => {
    // Filter by search term (name or description)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        exam.name.toLowerCase().includes(searchTerm) ||
        (exam.description?.toLowerCase().includes(searchTerm) ?? false);
      if (!matchesSearch) return false;
    }

    // Filter by class
    if (filters.classId && exam.classId !== filters.classId) {
      return false;
    }

    // Filter by subject
    if (filters.subjectId && exam.subjectId !== filters.subjectId) {
      return false;
    }

    // Filter by exam type
    if (filters.examType && exam.examType !== filters.examType) {
      return false;
    }

    // Filter by status
    if (filters.status) {
      const examStatus = getExamStatus(exam);
      if (examStatus !== filters.status) {
        return false;
      }
    }

    // Filter by date range
    if (filters.dateRange) {
      const examDate = new Date(exam.schedule.date);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (examDate < startDate || examDate > endDate) {
        return false;
      }
    }

    return true;
  });
};

// Sort exams based on sort options
export const sortExams = (
  exams: Exam[], 
  sortBy: keyof Exam = 'schedule',
  sortOrder: 'asc' | 'desc' = 'asc'
): Exam[] => {
  return [...exams].sort((a, b) => {
    let comparison = 0;
    let valueA: any = a;
    let valueB: any = b;

    // Handle nested properties
    if (sortBy.includes('.')) {
      const [parent, child] = sortBy.split('.');
      valueA = a[parent as keyof Exam];
      valueB = b[parent as keyof Exam];
      
      if (valueA && valueB && typeof valueA === 'object' && child in valueA) {
        valueA = valueA[child as keyof typeof valueA];
        valueB = valueB[child as keyof typeof valueB];
      }
    } else {
      valueA = a[sortBy as keyof Exam];
      valueB = b[sortBy as keyof Exam];
    }

    // Handle undefined or null values
    if (valueA === undefined || valueA === null) return sortOrder === 'asc' ? 1 : -1;
    if (valueB === undefined || valueB === null) return sortOrder === 'asc' ? -1 : 1;

    // Compare values based on type
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      comparison = valueA.localeCompare(valueB);
    } else if (valueA instanceof Date && valueB instanceof Date) {
      comparison = valueA.getTime() - valueB.getTime();
    } else if (typeof valueA === 'number' && typeof valueB === 'number') {
      comparison = valueA - valueB;
    } else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
      comparison = (valueA === valueB) ? 0 : valueA ? 1 : -1;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

// Paginate exam list
export const paginateExams = (
  exams: Exam[], 
  { page = 1, pageSize = 10 }: PaginationOptions
): Exam[] => {
  const startIndex = (page - 1) * pageSize;
  return exams.slice(startIndex, startIndex + pageSize);
};

// Get pagination metadata
export const getPaginationMeta = (
  totalItems: number, 
  currentPage: number, 
  pageSize: number
) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  
  return {
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    hasNextPage,
    hasPreviousPage,
  };
};

// Validate exam data before saving
export const validateExam = (exam: Partial<Exam>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!exam.name?.trim()) {
    errors.name = 'Exam name is required';
  }
  
  if (!exam.classId) {
    errors.classId = 'Class is required';
  }
  
  if (!exam.subjectId) {
    errors.subjectId = 'Subject is required';
  }
  
  if (!exam.examType) {
    errors.examType = 'Exam type is required';
  }
  
  if (typeof exam.totalMarks !== 'number' || exam.totalMarks <= 0) {
    errors.totalMarks = 'Total marks must be a positive number';
  }
  
  if (typeof exam.passingMarks !== 'number' || exam.passingMarks < 0) {
    errors.passingMarks = 'Passing marks must be a non-negative number';
  }
  
  if (exam.totalMarks && exam.passingMarks && exam.passingMarks > exam.totalMarks) {
    errors.passingMarks = 'Passing marks cannot be greater than total marks';
  }
  
  if (!exam.schedule?.date) {
    errors['schedule.date'] = 'Exam date is required';
  }
  
  if (!exam.schedule?.startTime) {
    errors['schedule.startTime'] = 'Start time is required';
  }
  
  if (!exam.schedule?.endTime) {
    errors['schedule.endTime'] = 'End time is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

import { Subject, SubjectStatus, SubjectType } from '../types/subject.d';

export interface FilterOptions {
  searchTerm?: string;
  status?: SubjectStatus | '';
  type?: SubjectType | '';
}

export const filterSubjects = (
  subjects: Subject[],
  { searchTerm = '', status = '', type = '' }: FilterOptions
): Subject[] => {
  const lowercasedSearch = searchTerm.toLowerCase();
  
  return subjects.filter((subject) => {
    const matchesSearch = 
      subject.name.toLowerCase().includes(lowercasedSearch) ||
      subject.code.toLowerCase().includes(lowercasedSearch) ||
      subject.description?.toLowerCase().includes(lowercasedSearch) ||
      false;
      
    const matchesStatus = !status || subject.status === status;
    const matchesType = !type || subject.type === type;
    
    return matchesSearch && matchesStatus && matchesType;
  });
};

export const sortSubjects = (
  subjects: Subject[],
  sortBy: keyof Subject = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
): Subject[] => {
  return [...subjects].sort((a, b) => {
    let comparison = 0;
    
    // Handle undefined or null values
    if (a[sortBy] === undefined || a[sortBy] === null) return 1;
    if (b[sortBy] === undefined || b[sortBy] === null) return -1;
    
    // Compare based on type
    if (typeof a[sortBy] === 'string' && typeof b[sortBy] === 'string') {
      comparison = (a[sortBy] as string).localeCompare(b[sortBy] as string);
    } else if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
      comparison = (a[sortBy] as number) - (b[sortBy] as number);
    } else if (a[sortBy] instanceof Date && b[sortBy] instanceof Date) {
      comparison = (a[sortBy] as Date).getTime() - (b[sortBy] as Date).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

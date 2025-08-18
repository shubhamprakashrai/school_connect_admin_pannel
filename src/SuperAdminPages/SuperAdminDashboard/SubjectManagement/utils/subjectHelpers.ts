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
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    
    // Handle undefined or null values
    if (valueA === undefined || valueA === null) return 1;
    if (valueB === undefined || valueB === null) return -1;
    
    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      // Handle date strings (like createdAt, updatedAt)
      if (['createdAt', 'updatedAt'].includes(sortBy)) {
        const dateA = new Date(valueA).getTime();
        const dateB = new Date(valueB).getTime();
        comparison = dateA - dateB;
      } else {
        comparison = valueA.localeCompare(valueB);
      }
    } 
    // Handle number comparison
    else if (typeof valueA === 'number' && typeof valueB === 'number') {
      comparison = valueA - valueB;
    } 
    // Handle Date objects
    else if (valueA && valueB && 
             typeof valueA === 'object' && 
             typeof valueB === 'object' &&
             'getTime' in valueA && 
             'getTime' in valueB) {
      comparison = (valueA as Date).getTime() - (valueB as Date).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

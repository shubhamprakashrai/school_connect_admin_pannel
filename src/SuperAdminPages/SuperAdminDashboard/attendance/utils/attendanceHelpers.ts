import { AttendanceRecord, AttendanceStatus, Student } from '../types/attendance';

export const filterAttendanceRecords = (
  records: AttendanceRecord[],
  filters: {
    classFilter?: string;
    sectionFilter?: string;
    dateFilter?: string;
    searchQuery?: string;
  }
): AttendanceRecord[] => {
  return records.filter(record => {
    const matchesClass = !filters.classFilter || record.class === filters.classFilter;
    const matchesSection = !filters.sectionFilter || record.section === filters.sectionFilter;
    const matchesDate = !filters.dateFilter || record.date === filters.dateFilter;
    
    const matchesSearch = !filters.searchQuery || 
      record.class.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      record.section.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      record.students.some(student => 
        student.name.toLowerCase().includes(filters.searchQuery!.toLowerCase()) ||
        student.rollNo.includes(filters.searchQuery!)
      );

    return matchesClass && matchesSection && matchesDate && matchesSearch;
  });
};

export const sortAttendanceRecords = (
  records: AttendanceRecord[],
  sortBy: 'date' | 'class',
  ascending: boolean = true
): AttendanceRecord[] => {
  return [...records].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'class') {
      comparison = a.class.localeCompare(b.class) || a.section.localeCompare(b.section);
    }
    
    return ascending ? comparison : -comparison;
  });
};

export const getAttendanceStats = (record: AttendanceRecord) => {
  const total = record.students.length;
  const present = record.students.filter(s => s.status === 'present').length;
  const absent = record.students.filter(s => s.status === 'absent').length;
  const leave = record.students.filter(s => s.status === 'leave').length;
  
  return { total, present, absent, leave };
};

export const initializeStudentAttendance = (
  students: Student[],
  existingAttendance?: { [key: string]: AttendanceStatus }
) => {
  return students.map(student => ({
    studentId: student.id,
    rollNo: student.rollNo,
    name: student.name,
    status: existingAttendance?.[student.id] || 'present' as const
  }));
};

export const getStatusBadgeClass = (status: AttendanceStatus) => {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800';
    case 'absent':
      return 'bg-red-100 text-red-800';
    case 'leave':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

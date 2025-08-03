import { Student, PaginatedStudentResponse, StudentFilters } from './types';

// Mock data
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    rollNo: 101,
    class: '10',
    section: 'A',
    gender: 'Male',
    dateOfBirth: '2010-05-15',
    email: 'john.doe@example.com',
    phone: '9876543210',
    parentName: 'James Doe',
    parentPhone: '9876543211',
    parentEmail: 'james.doe@example.com',
    admissionDate: '2020-04-01',
    address: '123 Main St, City',
    status: 'Active',
    transportOpted: true,
    hostelOpted: false,
    tags: ['Sports', 'Music'],
    avatar: 'https://i.pravatar.cc/150?u=1',
    createdAt: '2020-04-01T10:00:00Z',
    updatedAt: '2023-06-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    rollNo: 102,
    class: '10',
    section: 'B',
    gender: 'Female',
    dateOfBirth: '2010-08-22',
    email: 'jane.smith@example.com',
    phone: '9876543212',
    parentName: 'Robert Smith',
    parentPhone: '9876543213',
    parentEmail: 'robert.smith@example.com',
    admissionDate: '2020-04-01',
    address: '456 Oak Ave, Town',
    status: 'Active',
    transportOpted: false,
    hostelOpted: true,
    tags: ['Drama', 'Debate'],
    avatar: 'https://i.pravatar.cc/150?u=2',
    createdAt: '2020-04-01T10:00:00Z',
    updatedAt: '2023-06-10T11:20:00Z'
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const studentAPI = {
  // Get all students with pagination and filters
  getStudents: async (filters: StudentFilters = {}): Promise<PaginatedStudentResponse> => {
    // Simulate API delay
    await delay(500);
    
    // Apply filters
    let filteredStudents = [...mockStudents];
    
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredStudents = filteredStudents.filter(student => 
        student.name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.rollNo.toString().includes(searchTerm)
      );
    }
    
    if (filters.class) {
      filteredStudents = filteredStudents.filter(student => student.class === filters.class);
    }
    
    if (filters.section) {
      filteredStudents = filteredStudents.filter(student => student.section === filters.section);
    }
    
    if (filters.gender) {
      filteredStudents = filteredStudents.filter(student => student.gender === filters.gender);
    }
    
    if (filters.status) {
      filteredStudents = filteredStudents.filter(student => student.status === filters.status);
    }
    
    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + limit);
    
    return {
      data: paginatedStudents,
      total: filteredStudents.length,
      page,
      limit,
      totalPages: Math.ceil(filteredStudents.length / limit)
    };
  },

  // Get a single student by ID
  getStudentById: async (id: string): Promise<Student> => {
    await delay(300);
    const student = mockStudents.find(s => s.id === id);
    if (!student) throw new Error('Student not found');
    return student;
  },

  // Create a new student
  createStudent: async (formData: FormData): Promise<Student> => {
    await delay(500);
    const newStudent: Student = {
      id: (mockStudents.length + 1).toString(),
      name: formData.get('name') as string,
      rollNo: parseInt(formData.get('rollNo') as string, 10),
      class: formData.get('class') as string,
      section: formData.get('section') as string,
      gender: formData.get('gender') as 'Male' | 'Female' | 'Other',
      dateOfBirth: formData.get('dateOfBirth') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      parentName: formData.get('parentName') as string,
      parentPhone: formData.get('parentPhone') as string,
      parentEmail: formData.get('parentEmail') as string || '',
      admissionDate: formData.get('admissionDate') as string || new Date().toISOString().split('T')[0],
      address: formData.get('address') as string,
      status: 'Active',
      transportOpted: formData.get('transportOpted') === 'true',
      hostelOpted: formData.get('hostelOpted') === 'true',
      tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || [],
      avatar: 'https://i.pravatar.cc/150?u=' + (mockStudents.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockStudents.push(newStudent);
    return newStudent;
  },

  // Update an existing student
  updateStudent: async (id: string, formData: FormData): Promise<Student> => {
    await delay(500);
    const index = mockStudents.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');
    
    const updatedStudent: Student = {
      ...mockStudents[index],
      name: formData.get('name') as string || mockStudents[index].name,
      rollNo: formData.get('rollNo') ? parseInt(formData.get('rollNo') as string, 10) : mockStudents[index].rollNo,
      class: formData.get('class') as string || mockStudents[index].class,
      section: formData.get('section') as string || mockStudents[index].section,
      gender: (formData.get('gender') as 'Male' | 'Female' | 'Other') || mockStudents[index].gender,
      dateOfBirth: formData.get('dateOfBirth') as string || mockStudents[index].dateOfBirth,
      email: formData.get('email') as string || mockStudents[index].email,
      phone: formData.get('phone') as string || mockStudents[index].phone,
      parentName: formData.get('parentName') as string || mockStudents[index].parentName,
      parentPhone: formData.get('parentPhone') as string || mockStudents[index].parentPhone,
      parentEmail: formData.get('parentEmail') as string || mockStudents[index].parentEmail || '',
      address: formData.get('address') as string || mockStudents[index].address,
      status: (formData.get('status') as 'Active' | 'Inactive') || mockStudents[index].status,
      transportOpted: formData.has('transportOpted') ? formData.get('transportOpted') === 'true' : mockStudents[index].transportOpted,
      hostelOpted: formData.has('hostelOpted') ? formData.get('hostelOpted') === 'true' : mockStudents[index].hostelOpted,
      tags: formData.has('tags') ? (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) : mockStudents[index].tags || [],
      updatedAt: new Date().toISOString()
    };
    
    mockStudents[index] = updatedStudent;
    return updatedStudent;
  },

  // Delete a student
  deleteStudent: async (id: string, deletionReason?: string): Promise<{ success: boolean }> => {
    await delay(300);
    const index = mockStudents.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');
    
    // In a real implementation, you might want to log the deletion reason
    if (deletionReason) {
      console.log(`Deletion reason for student ${id}: ${deletionReason}`);
    }
    
    mockStudents.splice(index, 1);
    return { success: true };
  },

  // Export students to CSV/Excel (simplified for mock)
  exportStudents: async (): Promise<Blob> => {
    await delay(500);
    // In a real implementation, this would generate a CSV or Excel file
    return new Blob(['Mock export data'], { type: 'text/csv' });
  },

  // Get available classes (for dropdowns)
  getClasses: async (): Promise<string[]> => {
    await delay(200);
    const classes = Array.from(new Set(mockStudents.map(student => student.class)));
    return classes.sort();
  },

  // Get sections for a specific class (for dropdowns)
  getSections: async (classValue: string): Promise<string[]> => {
    await delay(200);
    const sections = Array.from(
      new Set(
        mockStudents
          .filter(student => student.class === classValue)
          .map(student => student.section)
      )
    );
    return sections.sort();
  },
};

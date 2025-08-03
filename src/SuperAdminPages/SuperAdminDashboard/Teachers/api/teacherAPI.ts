import { Teacher, TeacherFilterOptions, TeacherListResponse } from '../types/teacher.types';

// Helper to generate a random teacher ID
const generateTeacherId = () => `TCH${Math.floor(10000 + Math.random() * 90000)}`;

// Mock data
const mockTeachers: Teacher[] = [
  {
    id: '1',
    teacherId: generateTeacherId(),
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    alternatePhone: '+1234567891',
    dateOfBirth: '1985-05-15',
    gender: 'Male',
    address: '123 Teacher Street, City',
    qualification: 'M.Ed, B.Ed',
    experience: 8,
    specialization: ['Mathematics', 'Physics'],
    assignedClasses: ['10A', '11A'],
    joiningDate: '2020-01-15',
    isClassTeacher: true,
    transportAssigned: false,
    hostelAssigned: false,
    status: 'Active',
    profilePhoto: 'https://i.pravatar.cc/150?img=1',
    documents: [],
    createdAt: '2020-01-15T10:00:00Z',
    updatedAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '2',
    teacherId: generateTeacherId(),
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1987654321',
    alternatePhone: '+1987654322',
    dateOfBirth: '1990-08-22',
    gender: 'Female',
    address: '456 Educator Avenue, Town',
    qualification: 'Ph.D in English',
    experience: 5,
    specialization: ['English', 'Literature'],
    assignedClasses: ['9B', '10B'],
    joiningDate: '2019-06-10',
    isClassTeacher: true,
    transportAssigned: true,
    hostelAssigned: false,
    status: 'Active',
    profilePhoto: 'https://i.pravatar.cc/150?img=2',
    documents: [],
    createdAt: '2019-06-10T10:00:00Z',
    updatedAt: '2023-01-15T10:00:00Z'
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const teacherAPI = {
  // Get all teachers with filters
  async getTeachers(filters: Partial<TeacherFilterOptions> = {}): Promise<TeacherListResponse> {
    await delay(500);
    
    let filteredTeachers = [...mockTeachers];
    
    // Apply filters
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredTeachers = filteredTeachers.filter(teacher => 
        teacher.fullName.toLowerCase().includes(searchTerm) ||
        teacher.email.toLowerCase().includes(searchTerm) ||
        teacher.phone.includes(searchTerm) ||
        teacher.teacherId.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.status) {
      filteredTeachers = filteredTeachers.filter(teacher => teacher.status === filters.status);
    }
    
    if (filters.specialization && filters.specialization.length > 0) {
      filteredTeachers = filteredTeachers.filter(teacher => 
        filters.specialization?.some(spec => teacher.specialization.includes(spec))
      );
    }
    
    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + limit);
    
    return {
      data: paginatedTeachers,
      total: filteredTeachers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredTeachers.length / limit)
    };
  },

  // Get single teacher by ID
  async getTeacherById(id: string): Promise<Teacher> {
    await delay(300);
    const teacher = mockTeachers.find(t => t.id === id);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    return teacher;
  },

  // Create new teacher
  async createTeacher(formData: FormData): Promise<Teacher> {
    await delay(500);
    const newTeacher: Teacher = {
      id: (mockTeachers.length + 1).toString(),
      teacherId: generateTeacherId(),
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      alternatePhone: formData.get('alternatePhone') as string || undefined,
      dateOfBirth: formData.get('dateOfBirth') as string,
      gender: formData.get('gender') as 'Male' | 'Female' | 'Other',
      address: formData.get('address') as string,
      qualification: formData.get('qualification') as string,
      experience: parseInt(formData.get('experience') as string) || 0,
      specialization: (formData.get('specialization') as string)?.split(',').map(s => s.trim()) || [],
      assignedClasses: (formData.get('assignedClasses') as string)?.split(',').map(s => s.trim()) || [],
      joiningDate: formData.get('joiningDate') as string || new Date().toISOString().split('T')[0],
      isClassTeacher: formData.get('isClassTeacher') === 'true',
      transportAssigned: formData.get('transportAssigned') === 'true',
      hostelAssigned: formData.get('hostelAssigned') === 'true',
      status: 'Active',
      profilePhoto: 'https://i.pravatar.cc/150?u=' + (mockTeachers.length + 1),
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockTeachers.push(newTeacher);
    return newTeacher;
  },

  // Update teacher
  async updateTeacher(id: string, formData: FormData): Promise<Teacher> {
    await delay(500);
    const index = mockTeachers.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Teacher not found');
    }
    
    const updatedTeacher: Teacher = {
      ...mockTeachers[index],
      fullName: formData.get('fullName') as string || mockTeachers[index].fullName,
      email: formData.get('email') as string || mockTeachers[index].email,
      phone: formData.get('phone') as string || mockTeachers[index].phone,
      alternatePhone: formData.get('alternatePhone') as string || mockTeachers[index].alternatePhone,
      dateOfBirth: formData.get('dateOfBirth') as string || mockTeachers[index].dateOfBirth,
      gender: (formData.get('gender') as 'Male' | 'Female' | 'Other') || mockTeachers[index].gender,
      address: formData.get('address') as string || mockTeachers[index].address,
      qualification: formData.get('qualification') as string || mockTeachers[index].qualification,
      experience: formData.get('experience') ? parseInt(formData.get('experience') as string) : mockTeachers[index].experience,
      specialization: (formData.get('specialization') as string)?.split(',').map(s => s.trim()) || mockTeachers[index].specialization,
      assignedClasses: (formData.get('assignedClasses') as string)?.split(',').map(s => s.trim()) || mockTeachers[index].assignedClasses,
      joiningDate: formData.get('joiningDate') as string || mockTeachers[index].joiningDate,
      isClassTeacher: formData.get('isClassTeacher') ? formData.get('isClassTeacher') === 'true' : mockTeachers[index].isClassTeacher,
      transportAssigned: formData.get('transportAssigned') ? formData.get('transportAssigned') === 'true' : mockTeachers[index].transportAssigned,
      hostelAssigned: formData.get('hostelAssigned') ? formData.get('hostelAssigned') === 'true' : mockTeachers[index].hostelAssigned,
      status: (formData.get('status') as 'Active' | 'Inactive') || mockTeachers[index].status,
      updatedAt: new Date().toISOString()
    };
    
    mockTeachers[index] = updatedTeacher;
    return updatedTeacher;
  },

  // Delete teacher
  async deleteTeacher(id: string): Promise<void> {
    await delay(500);
    const index = mockTeachers.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Teacher not found');
    }
    mockTeachers.splice(index, 1);
  },

  // Get teacher statistics
  async getTeacherStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    bySpecialization: Record<string, number>;
  }> {
    await delay(500);
    const total = mockTeachers.length;
    const active = mockTeachers.filter(t => t.status === 'Active').length;
    
    const bySpecialization: Record<string, number> = {};
    mockTeachers.forEach(teacher => {
      teacher.specialization.forEach(spec => {
        bySpecialization[spec] = (bySpecialization[spec] || 0) + 1;
      });
    });
    
    return {
      total,
      active,
      inactive: total - active,
      bySpecialization
    };
  },

  // Export teachers data
  async exportTeachers(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    await delay(1000);
    
    // Convert teachers data to CSV
    const headers = ['Teacher ID', 'Full Name', 'Email', 'Phone', 'Status', 'Joining Date', 'Specialization', 'Assigned Classes'];
    const csvRows = [
      headers.join(','),
      ...mockTeachers.map(teacher => 
        [
          teacher.teacherId,
          `"${teacher.fullName}"`,
          teacher.email,
          teacher.phone,
          teacher.status,
          teacher.joiningDate,
          `"${teacher.specialization.join(', ')}"`,
          `"${teacher.assignedClasses.join(', ')}"`
        ].join(',')
      )
    ];
    
    const csvString = csvRows.join('\n');
    return new Blob([csvString], { type: 'text/csv' });
  },

  // Upload teacher document
  async uploadDocument(teacherId: string, file: File, type: 'resume' | 'certificate' | 'other' = 'other'): Promise<{ url: string }> {
    await delay(500);
    const teacher = mockTeachers.find(t => t.id === teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    
    const documentId = `doc-${Math.random().toString(36).substr(2, 9)}`;
    const documentUrl = `https://example.com/documents/${documentId}/${file.name}`;
    
    const newDocument = {
      id: documentId,
      name: file.name,
      type: type,
      url: documentUrl
    };
    
    if (!teacher.documents) {
      teacher.documents = [];
    }
    teacher.documents.push(newDocument);
    
    return { url: documentUrl };
  },

  // Delete teacher document
  async deleteDocument(teacherId: string, documentId: string): Promise<void> {
    await delay(300);
    const teacher = mockTeachers.find(t => t.id === teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    
    if (teacher.documents) {
      const docIndex = teacher.documents.findIndex(doc => doc.id === documentId);
      if (docIndex !== -1) {
        teacher.documents.splice(docIndex, 1);
      }
    }
  },

  // Get teacher's assigned classes
  async getAssignedClasses(teacherId: string): Promise<string[]> {
    await delay(300);
    const teacher = mockTeachers.find(t => t.id === teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    return [...teacher.assignedClasses];
  },

  // Update teacher's assigned classes
  async updateAssignedClasses(teacherId: string, classes: string[]): Promise<void> {
    await delay(500);
    const teacher = mockTeachers.find(t => t.id === teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    teacher.assignedClasses = [...classes];
    teacher.updatedAt = new Date().toISOString();
  },

  // Get teacher's schedule (mock implementation)
  async getTeacherSchedule(teacherId: string): Promise<any> {
    await delay(500);
    const teacher = mockTeachers.find(t => t.id === teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    
    // Mock schedule data
    return {
      teacherId,
      teacherName: teacher.fullName,
      schedule: [
        {
          day: 'Monday',
          classes: [
            { time: '09:00-10:00', className: '10A', subject: teacher.specialization[0] || 'General' },
            { time: '11:00-12:00', className: '11A', subject: teacher.specialization[0] || 'General' }
          ]
        },
        {
          day: 'Tuesday',
          classes: [
            { time: '10:00-11:00', className: '10B', subject: teacher.specialization[0] || 'General' },
            { time: '14:00-15:00', className: '11B', subject: teacher.specialization[0] || 'General' }
          ]
        },
        // Add more days as needed
      ]
    };
  },
  
  // Update teacher's schedule (mock implementation)
  async updateTeacherSchedule(teacherId: string, schedule: any): Promise<void> {
    await delay(500);
    const teacher = mockTeachers.find(t => t.id === teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    // In a real implementation, this would update the schedule in the database
    console.log(`Updated schedule for teacher ${teacherId}:`, schedule);
  }
};

import { ClassData, ClassFormData, ClassListFilters, TeacherOption } from './types';

// Mock data for demonstration
const mockClasses: ClassData[] = [
  {
    id: '1',
    className: 'Class 1',
    status: 'Active',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    sections: [
      { id: '1-1', name: 'A', studentCount: 25, classTeacher: { id: 't1', name: 'John Doe' } },
      { id: '1-2', name: 'B', studentCount: 20, classTeacher: { id: 't2', name: 'Jane Smith' } },
    ],
  },
  {
    id: '2',
    className: 'Class 2',
    status: 'Active',
    createdAt: '2023-01-02',
    updatedAt: '2023-01-02',
    sections: [
      { id: '2-1', name: 'A', studentCount: 22, classTeacher: { id: 't3', name: 'Robert Johnson' } },
    ],
  },
];

// Mock teachers data
const mockTeachers: TeacherOption[] = [
  { id: 't1', name: 'John Doe', email: 'john@example.com' },
  { id: 't2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: 't3', name: 'Robert Johnson', email: 'robert@example.com' },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ClassAPI {
  // Fetch all classes with optional filters
  async getClasses(filters?: ClassListFilters): Promise<ClassData[]> {
    await delay(500); // Simulate network delay
    
    let result = [...mockClasses];
    
    if (filters) {
      // Apply status filter
      if (filters.status) {
        result = result.filter(cls => cls.status === filters.status);
      }
      
      // Apply class teacher filter
      if (filters.classTeacherId) {
        result = result.filter(cls => 
          cls.sections.some(section => section.classTeacher?.id === filters.classTeacherId)
        );
      }
      
      // Apply search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        result = result.filter(cls => 
          cls.className.toLowerCase().includes(query) ||
          cls.sections.some(section => section.name.toLowerCase().includes(query))
        );
      }
    }
    
    return result;
  }
  
  // Get a single class by ID
  async getClassById(id: string): Promise<ClassData | undefined> {
    await delay(300);
    return mockClasses.find(cls => cls.id === id);
  }
  
  // Create a new class
  async createClass(classData: ClassFormData): Promise<ClassData> {
    await delay(500);
    const newClass: ClassData = {
      id: Math.random().toString(36).substr(2, 9),
      className: classData.className,
      status: classData.status,
      sections: classData.sections.map((section, index) => ({
        id: `${Math.random().toString(36).substr(2, 5)}-${index}`,
        name: section.name,
        maxStudents: section.maxStudents,
        classTeacher: section.classTeacherId 
          ? mockTeachers.find(t => t.id === section.classTeacherId)
          : undefined,
        studentCount: 0,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockClasses.push(newClass);
    return newClass;
  }
  
  // Update an existing class
  async updateClass(id: string, classData: ClassFormData): Promise<ClassData> {
    await delay(500);
    const index = mockClasses.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Class not found');
    }
    
    const updatedClass: ClassData = {
      ...mockClasses[index],
      className: classData.className,
      status: classData.status,
      sections: classData.sections.map((section, idx) => ({
        id: mockClasses[index].sections[idx]?.id || `${Math.random().toString(36).substr(2, 5)}-${idx}`,
        name: section.name,
        maxStudents: section.maxStudents,
        classTeacher: section.classTeacherId 
          ? mockTeachers.find(t => t.id === section.classTeacherId)
          : undefined,
        studentCount: mockClasses[index].sections[idx]?.studentCount || 0,
      })),
      updatedAt: new Date().toISOString(),
    };
    
    mockClasses[index] = updatedClass;
    return updatedClass;
  }
  
  // Delete a class
  async deleteClass(id: string): Promise<void> {
    await delay(300);
    const index = mockClasses.findIndex(c => c.id === id);
    if (index !== -1) {
      mockClasses.splice(index, 1);
    }
  }
  
  // Get all teachers (for dropdowns)
  async getTeachers(): Promise<TeacherOption[]> {
    await delay(300);
    return [...mockTeachers];
  }
}

export const classAPI = new ClassAPI();

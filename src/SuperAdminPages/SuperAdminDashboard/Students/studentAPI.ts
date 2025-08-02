import { Student, StudentFormData, PaginatedStudentResponse, StudentFilters } from './types';

// Mock API URL - Replace with your actual API endpoint
const API_URL = '/api/students';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const studentAPI = {
  // Get all students with pagination and filters
  getStudents: async (filters: StudentFilters = {}): Promise<PaginatedStudentResponse> => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if they exist
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`${API_URL}?${queryParams.toString()}`);
    return handleResponse(response);
  },

  // Get a single student by ID
  getStudentById: async (id: string): Promise<Student> => {
    const response = await fetch(`${API_URL}/${id}`);
    return handleResponse(response);
  },

  // Create a new student
  createStudent: async (studentData: FormData): Promise<Student> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: studentData,
      // Note: Don't set Content-Type header when using FormData
      // The browser will set it with the correct boundary
    });
    return handleResponse(response);
  },

  // Update an existing student
  updateStudent: async (id: string, studentData: FormData): Promise<Student> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      body: studentData,
    });
    return handleResponse(response);
  },

  // Delete a student
  deleteStudent: async (id: string, reason?: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  // Export students to CSV/Excel
  exportStudents: async (filters: StudentFilters = {}): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if they exist
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`${API_URL}/export?${queryParams.toString()}`, {
      headers: {
        'Accept': 'text/csv', // or 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' for Excel
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Export failed');
    }
    
    return response.blob();
  },

  // Get available classes (for dropdowns)
  getClasses: async (): Promise<string[]> => {
    // Mock data - replace with actual API call
    return ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  },

  // Get sections for a specific class (for dropdowns)
  getSections: async (classValue: string): Promise<string[]> => {
    // Mock data - replace with actual API call
    return ['A', 'B', 'C', 'D'];
  },
};

import axios from 'axios';
import { Teacher, TeacherFormData, TeacherFilterOptions, TeacherListResponse } from '../types/teacher.types';

const API_BASE_URL = '/api/teachers';

export const teacherAPI = {
  // Get all teachers with filters
  async getTeachers(filters: Partial<TeacherFilterOptions> = {}): Promise<TeacherListResponse> {
    const response = await axios.get<TeacherListResponse>(API_BASE_URL, { params: filters });
    return response.data;
//   },

//   // Get single teacher by ID
//   async getTeacherById(id: string): Promise<Teacher> {
//     const response = await axios.get<Teacher>(`${API_BASE_URL}/${id}`);
//     return response.data;
//   },

//   // Create new teacher
//   async createTeacher(teacherData: FormData): Promise<Teacher> {
//     const response = await axios.post<Teacher>(API_BASE_URL, teacherData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },

//   // Update teacher
//   async updateTeacher(id: string, teacherData: Partial<TeacherFormData>): Promise<Teacher> {
//     const response = await axios.put<Teacher>(`${API_BASE_URL}/${id}`, teacherData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },

//   // Delete teacher
//   async deleteTeacher(id: string): Promise<void> {
//     await axios.delete(`${API_BASE_URL}/${id}`);
//   },

//   // Update teacher status
//   async updateTeacherStatus(id: string, status: 'Active' | 'Inactive'): Promise<Teacher> {
//     const response = await axios.patch<Teacher>(`${API_BASE_URL}/${id}/status`, { status });
//     return response.data;
//   },

//   // Get teacher statistics
//   async getTeacherStatistics() {
//     const response = await axios.get(`${API_BASE_URL}/statistics`);
//     return response.data;
//   },

//   // Export teachers to CSV/Excel
//   async exportTeachers(filters: Partial<TeacherFilterOptions> = {}) {
//     const response = await axios.get(`${API_BASE_URL}/export`, {
//       params: filters,
//       responseType: 'blob',
//     });
//     return response.data;
//   },

//   // Upload teacher document
//   async uploadDocument(teacherId: string, file: File, type: 'resume' | 'certificate' | 'other') {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('type', type);
    
//     const response = await axios.post(`${API_BASE_URL}/${teacherId}/documents`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },

//   // Delete teacher document
//   async deleteDocument(teacherId: string, documentId: string): Promise<void> {
//     await axios.delete(`${API_BASE_URL}/${teacherId}/documents/${documentId}`);
//   },
// };

import { AttendanceRecord } from '../types/attendance';
import { dummyStudents } from './dummyStudents';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const dummyAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att1',
    date: today,
    class: 'Grade 1',
    section: 'A',
    students: [
      {
        studentId: 'stu1',
        rollNo: '1',
        name: 'Rahul Sharma',
        status: 'present'
      },
      {
        studentId: 'stu2',
        rollNo: '2',
        name: 'Priya Patel',
        status: 'absent'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'att2',
    date: yesterday,
    class: 'Grade 2',
    section: 'A',
    students: [
      {
        studentId: 'stu4',
        rollNo: '4',
        name: 'Neha Gupta',
        status: 'present'
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'att3',
    date: yesterday,
    class: 'Grade 1',
    section: 'B',
    students: [
      {
        studentId: 'stu3',
        rollNo: '3',
        name: 'Amit Kumar',
        status: 'leave'
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

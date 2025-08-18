import { Exam, ExamStatus, ExamType } from '../types/exam.types';
import { v4 as uuidv4 } from 'uuid';

const currentDate = new Date();
const nextWeek = new Date();
nextWeek.setDate(currentDate.getDate() + 7);
const lastWeek = new Date();
lastWeek.setDate(currentDate.getDate() - 7);

const generateExam = (overrides: Partial<Exam> = {}): Exam => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const examDate = new Date();
  examDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 30) - 7); // Random date within next 30 days
  
  const startHour = 9 + Math.floor(Math.random() * 6); // Between 9 AM and 3 PM
  const endHour = startHour + 1 + Math.floor(Math.random() * 2); // 1-2 hours duration

  return {
    id,
    name: '',
    classId: '',
    subjectId: '',
    examType: ExamType.MIDTERM,
    totalMarks: 100,
    passingMarks: 33,
    description: '',
    status: ExamStatus.UPCOMING,
    createdAt: now,
    updatedAt: now,
    schedule: {
      id: uuidv4(),
      date: examDate.toISOString().split('T')[0],
      startTime: `${startHour.toString().padStart(2, '0')}:00:00`,
      endTime: `${endHour.toString().padStart(2, '0')}:00:00`,
      venue: 'Main Hall',
      supervisor: 'Teacher ' + Math.floor(Math.random() * 10 + 1),
    },
    ...overrides,
  };
};

const exams: Exam[] = [
  // Upcoming Exams
  generateExam({
    name: 'First Term - English',
    classId: 'class12', // Class 9
    subjectId: 'sub14', // English
    examType: ExamType.MIDTERM,
    status: ExamStatus.UPCOMING,
    schedule: {
      id: uuidv4(),
      date: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
      startTime: '10:00:00',
      endTime: '13:00:00',
      venue: 'Room 101',
      supervisor: 'Mr. Sharma',
    },
  }),
  
  generateExam({
    name: 'Unit Test - Mathematics',
    classId: 'class9', // Class 6
    subjectId: 'sub9', // Mathematics
    examType: ExamType.UNIT_TEST,
    status: ExamStatus.UPCOMING,
    schedule: {
      id: uuidv4(),
      date: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
      startTime: '09:30:00',
      endTime: '11:30:00',
      venue: 'Room 205',
      supervisor: 'Ms. Gupta',
    },
  }),
  
  // Ongoing Exam (if current time is between start and end time)
  generateExam({
    name: 'Science Practical',
    classId: 'class12', // Class 9
    subjectId: 'sub16', // Science
    examType: ExamType.PRACTICAL,
    status: ExamStatus.ONGOING,
    schedule: {
      id: uuidv4(),
      date: currentDate.toISOString().split('T')[0], // Today
      startTime: '11:00:00',
      endTime: '13:00:00',
      venue: 'Science Lab 1',
      supervisor: 'Dr. Patel',
    },
  }),
  
  // Completed Exams
  generateExam({
    name: 'Half Yearly - Social Science',
    classId: 'class12', // Class 9
    subjectId: 'sub17', // Social Science
    examType: ExamType.MIDTERM,
    status: ExamStatus.COMPLETED,
    schedule: {
      id: uuidv4(),
      date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      startTime: '09:00:00',
      endTime: '12:00:00',
      venue: 'Room 101',
      supervisor: 'Mr. Verma',
    },
  }),
  
  generateExam({
    name: 'Quiz - Computer Science',
    classId: 'class14', // Class 11
    subjectId: 'sub25', // Computer Science
    examType: ExamType.QUIZ,
    status: ExamStatus.COMPLETED,
    schedule: {
      id: uuidv4(),
      date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
      startTime: '14:00:00',
      endTime: '15:00:00',
      venue: 'Computer Lab 2',
      supervisor: 'Mr. Kumar',
    },
  }),
];

export default exams;

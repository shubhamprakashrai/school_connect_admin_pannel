import { Subject } from '../types/exam.types';

export const subjects: Subject[] = [
  // Pre-School
  { id: 'sub1', name: 'English', code: 'ENG-PRE', classId: 'class1' },
  { id: 'sub2', name: 'Numbers', code: 'NUM-PRE', classId: 'class1' },
  { id: 'sub3', name: 'Rhymes', code: 'RHY-PRE', classId: 'class1' },
  
  // Primary (Classes 1-5)
  { id: 'sub4', name: 'English', code: 'ENG-1', classId: 'class4' },
  { id: 'sub5', name: 'Mathematics', code: 'MATH-1', classId: 'class4' },
  { id: 'sub6', name: 'Environmental Studies', code: 'EVS-1', classId: 'class4' },
  { id: 'sub7', name: 'Hindi', code: 'HIN-1', classId: 'class4' },
  
  // Middle School (Classes 6-8)
  { id: 'sub8', name: 'English', code: 'ENG-6', classId: 'class9' },
  { id: 'sub9', name: 'Mathematics', code: 'MATH-6', classId: 'class9' },
  { id: 'sub10', name: 'Science', code: 'SCI-6', classId: 'class9' },
  { id: 'sub11', name: 'Social Studies', code: 'SST-6', classId: 'class9' },
  { id: 'sub12', name: 'Hindi', code: 'HIN-6', classId: 'class9' },
  { id: 'sub13', name: 'Sanskrit', code: 'SAN-6', classId: 'class9' },
  
  // Secondary (Classes 9-10)
  { id: 'sub14', name: 'English', code: 'ENG-9', classId: 'class12' },
  { id: 'sub15', name: 'Mathematics', code: 'MATH-9', classId: 'class12' },
  { id: 'sub16', name: 'Science', code: 'SCI-9', classId: 'class12' },
  { id: 'sub17', name: 'Social Science', code: 'SSC-9', classId: 'class12' },
  { id: 'sub18', name: 'Hindi', code: 'HIN-9', classId: 'class12' },
  { id: 'sub19', name: 'Computer Science', code: 'CS-9', classId: 'class12' },
  
  // Senior Secondary (Classes 11-12) - Science Stream
  { id: 'sub20', name: 'Physics', code: 'PHY-11', classId: 'class14' },
  { id: 'sub21', name: 'Chemistry', code: 'CHEM-11', classId: 'class14' },
  { id: 'sub22', name: 'Mathematics', code: 'MATH-11', classId: 'class14' },
  { id: 'sub23', name: 'Biology', code: 'BIO-11', classId: 'class14' },
  { id: 'sub24', name: 'Computer Science', code: 'CS-11', classId: 'class14' },
  { id: 'sub25', name: 'English Core', code: 'ENG-11', classId: 'class14' },
  
  // Commerce Stream
  { id: 'sub26', name: 'Accountancy', code: 'ACC-11', classId: 'class14' },
  { id: 'sub27', name: 'Business Studies', code: 'BST-11', classId: 'class14' },
  { id: 'sub28', name: 'Economics', code: 'ECO-11', classId: 'class14' },
  { id: 'sub29', name: 'Mathematics', code: 'MATH-11-C', classId: 'class14' },
  { id: 'sub30', name: 'Informatics Practices', code: 'IP-11', classId: 'class14' },
  
  // Arts Stream
  { id: 'sub31', name: 'History', code: 'HIS-11', classId: 'class14' },
  { id: 'sub32', name: 'Political Science', code: 'POL-11', classId: 'class14' },
  { id: 'sub33', name: 'Geography', code: 'GEO-11', classId: 'class14' },
  { id: 'sub34', name: 'Economics', code: 'ECO-11-A', classId: 'class14' },
  { id: 'sub35', name: 'Psychology', code: 'PSY-11', classId: 'class14' },
];

export default subjects;

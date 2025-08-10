import { Subject, SubjectStatus, SubjectType } from '../types/subject.d';

const dummySubjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    code: 'MATH101',
    description: 'Introduction to basic mathematical concepts',
    status: SubjectStatus.ACTIVE,
    type: SubjectType.CORE,
    credits: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Science',
    code: 'SCI101',
    description: 'Basic scientific principles and methods',
    status: SubjectStatus.ACTIVE,
    type: SubjectType.CORE,
    credits: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'English',
    code: 'ENG101',
    description: 'English language and literature',
    status: SubjectStatus.ACTIVE,
    type: SubjectType.CORE,
    credits: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default dummySubjects;
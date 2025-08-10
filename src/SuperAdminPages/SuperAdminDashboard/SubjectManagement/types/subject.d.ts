export enum SubjectStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export enum SubjectType {
  CORE = 'core',
  ELECTIVE = 'elective',
  LANGUAGE = 'language',
  OTHER = 'other'
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  status: SubjectStatus;
  type: SubjectType;
  credits?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default Subject;
export enum NoticeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum NoticeAudience {
  ALL = 'all',
  TEACHERS = 'teachers',
  STUDENTS = 'students',
  PARENTS = 'parents'
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  audience: NoticeAudience;
  status: NoticeStatus;
  createdAt: string;
  updatedAt: string;
}

export default Notice;

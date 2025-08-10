import { Notice, NoticeStatus, NoticeAudience } from '../types/notice';

const now = new Date();
const oneDay = 24 * 60 * 60 * 1000; // in milliseconds

const dummyNotices: Notice[] = [
  {
    id: '1',
    title: 'School Reopening',
    description: 'School will reopen on 15th August after summer break. All students are requested to attend.',
    date: new Date(now.getTime() + (7 * oneDay)).toISOString(),
    audience: 'all' as NoticeAudience,
    status: 'active' as NoticeStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'PTA Meeting',
    description: 'Quarterly PTA meeting will be held on 20th August at 10:00 AM in the school auditorium.',
    date: new Date(now.getTime() + (10 * oneDay)).toISOString(),
    audience: 'parents' as NoticeAudience,
    status: 'active' as NoticeStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Staff Training Session',
    description: 'All teaching staff are required to attend the training session on new teaching methodologies.',
    date: new Date(now.getTime() - (2 * oneDay)).toISOString(),
    audience: 'teachers' as NoticeAudience,
    status: 'inactive' as NoticeStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Annual Sports Day',
    description: 'Annual sports day will be held on 25th August. Students should come in their sports uniform.',
    date: new Date(now.getTime() + (15 * oneDay)).toISOString(),
    audience: 'students' as NoticeAudience,
    status: 'active' as NoticeStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Library Closure',
    description: 'The school library will remain closed on 12th August for maintenance work.',
    date: new Date(now.getTime() + (5 * oneDay)).toISOString(),
    audience: 'all' as NoticeAudience,
    status: 'active' as NoticeStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default dummyNotices;

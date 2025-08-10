import { Notice, NoticeAudience, NoticeStatus } from '../types/notice';

export const filterNotices = (
  notices: Notice[],
  filters: {
    searchTerm?: string;
    audience?: NoticeAudience | 'All';
    status?: NoticeStatus | 'All';
  }
): Notice[] => {
  return notices.filter((notice) => {
    // Filter by search term (title)
    const matchesSearch = !filters.searchTerm ||
      notice.title.toLowerCase().includes(filters.searchTerm.toLowerCase());

    // Filter by audience
    const matchesAudience = !filters.audience ||
      filters.audience === 'All' ||
      notice.audience === filters.audience;

    // Filter by status
    const matchesStatus = !filters.status ||
      filters.status === 'All' ||
      notice.status === filters.status;

    return matchesSearch && matchesAudience && matchesStatus;
  });
};

export const sortNotices = (
  notices: Notice[],
  key: keyof Omit<Notice, 'id' | 'description' | 'createdAt' | 'updatedAt'>,
  direction: 'asc' | 'desc'
): Notice[] => {
  return [...notices].sort((a, b) => {
    let compareResult = 0;

    if (key === 'date') {
      const dateA = new Date(a[key]).getTime();
      const dateB = new Date(b[key]).getTime();
      compareResult = dateA - dateB;
    } else {
      // For string comparisons
      const valueA = String(a[key]).toLowerCase();
      const valueB = String(b[key]).toLowerCase();
      compareResult = valueA.localeCompare(valueB);
    }

    return direction === 'asc' ? compareResult : -compareResult;
  });
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const getStatusBadgeClass = (status: NoticeStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded';
    default:
      return 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded';
  }
};

export const getAudienceBadgeClass = (audience: NoticeAudience): string => {
  switch (audience) {
    case 'all':
      return 'bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded';
    case 'teachers':
      return 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded';
    case 'students':
      return 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded';
    case 'parents':
      return 'bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded';
    default:
      return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded';
  }
};

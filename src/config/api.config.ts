// Base API URL
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// API Version
const API_VERSION = 'v1';

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  REGISTER: `${BASE_URL}/api/auth/register`,
  REFRESH_TOKEN: `${BASE_URL}/api/auth/refresh`,
  LOGOUT: `${BASE_URL}/api/auth/logout`,
  FORGOT_PASSWORD: `${BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${BASE_URL}/api/auth/reset-password`,
  VERIFY_EMAIL: `${BASE_URL}/api/auth/verify-email`,
  RESEND_VERIFICATION: `${BASE_URL}/api/auth/resend-verification`,
  CHANGE_PASSWORD: `${BASE_URL}/api/auth/change-password`,
  VALIDATE_TOKEN: `${BASE_URL}/api/auth/validate-token`,
};



// User Management Endpoints
export const USER_ENDPOINTS = {
  PROFILE: `${BASE_URL}/api/${API_VERSION}/users/profile`,
  USERS: `${BASE_URL}/api/${API_VERSION}/users`,
  ROLES: `${BASE_URL}/api/${API_VERSION}/users/roles`,
  PERMISSIONS: `${BASE_URL}/api/${API_VERSION}/users/permissions`,
};

// School Management Endpoints
export const SCHOOL_ENDPOINTS = {
  SCHOOLS: `${BASE_URL}/api/${API_VERSION}/schools`,
  CLASSES: `${BASE_URL}/api/${API_VERSION}/schools/classes`,
  SECTIONS: `${BASE_URL}/api/${API_VERSION}/schools/sections`,
  SUBJECTS: `${BASE_URL}/api/${API_VERSION}/schools/subjects`,
};

// Student Management Endpoints
export const STUDENT_ENDPOINTS = {
  STUDENTS: `${BASE_URL}/api/${API_VERSION}/students`,
  ATTENDANCE: `${BASE_URL}/api/${API_VERSION}/students/attendance`,
  GRADES: `${BASE_URL}/api/${API_VERSION}/students/grades`,
};

// Teacher Management Endpoints
export const TEACHER_ENDPOINTS = {
  TEACHERS: `${BASE_URL}/api/${API_VERSION}/teachers`,
  TIMETABLE: `${BASE_URL}/api/${API_VERSION}/teachers/timetable`,
  ATTENDANCE: `${BASE_URL}/api/${API_VERSION}/teachers/attendance`,
};

// Parent Management Endpoints
export const PARENT_ENDPOINTS = {
  PARENTS: `${BASE_URL}/api/${API_VERSION}/parents`,
  CHILDREN: `${BASE_URL}/api/${API_VERSION}/parents/children`,
};

// Notice Board Endpoints
export const NOTICE_ENDPOINTS = {
  NOTICES: `${BASE_URL}/api/${API_VERSION}/notices`,
  EVENTS: `${BASE_URL}/api/${API_VERSION}/events`,
};

// Settings Endpoints
export const SETTINGS_ENDPOINTS = {
  GENERAL: `${BASE_URL}/api/${API_VERSION}/settings/general`,
  SCHOOL: `${BASE_URL}/api/${API_VERSION}/settings/school`,
  EMAIL: `${BASE_URL}/api/${API_VERSION}/settings/email`,
};

// File Upload Endpoint
export const FILE_UPLOAD = `${BASE_URL}/api/${API_VERSION}/upload`;

// Export all endpoints as a single object for convenience
export const API_ENDPOINTS = {
  ...AUTH_ENDPOINTS,
  ...USER_ENDPOINTS,
  ...SCHOOL_ENDPOINTS,
  ...STUDENT_ENDPOINTS,
  ...TEACHER_ENDPOINTS,
  ...PARENT_ENDPOINTS,
  ...NOTICE_ENDPOINTS,
  ...SETTINGS_ENDPOINTS,
  FILE_UPLOAD,
};

export default {
  BASE_URL,
  API_VERSION,
  ...API_ENDPOINTS,
};




// Username: admin_user
// Password: Admin@123
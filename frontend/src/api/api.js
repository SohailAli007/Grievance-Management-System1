import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Base Axios instance with placeholder baseURL
const apiClient = axios.create({
  baseURL: API_BASE_URL, // Replace with real backend URL
  timeout: 10000,
});

// Interceptor for attaching auth token and handling "Header Too Large" (431) errors
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gms_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 431 error means the token in headers is too bloated. We must clear it.
    if (error.response?.status === 431) {
      console.error("Critical: Token header too large. Clearing storage.");
      localStorage.removeItem('gms_token');
      window.location.href = '/login?error=header_too_large';
    }
    return Promise.reject(error);
  }
);

// =====================================
//              LOGIN
// =====================================
export async function login(payload) {
  try {
    const { data } = await apiClient.post('/login', payload);
    return data;
  } catch (err) {
    // surface server error message when available
    const msg = err?.response?.data?.error || err?.message || 'Login failed';
    throw new Error(msg);
  }
}

// =====================================
//              REGISTER
// =====================================
export async function register(payload) {
  // ❌ REMOVE fake logs
  // console.info('register() called with', payload);

  // ✅ REQUIRED
  const { data } = await apiClient.post('/register', payload);
  return data;

  // ❌ REMOVE mock code
  // return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 400));
}

// =====================================
//          FILE COMPLAINT
// =====================================
export async function fileComplaint(payload) {
  // ❌ REMOVE placeholder
  // console.info('fileComplaint() called with', payload);

  // ✅ REQUIRED
  const { data } = await apiClient.post('/complaints', payload);
  return data;

  // ❌ REMOVE mock
  // return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 400));
}

// =====================================
//        USER COMPLAINTS
// =====================================
export async function getUserComplaints() {
  // ❌ REMOVE
  // console.info('getUserComplaints() called');

  // ❌ REMOVE placeholder return null
  // return null;

  // ✅ REQUIRED
  const { data } = await apiClient.get('/complaints/my');
  return data;
}

// =====================================
//        OFFICER COMPLAINTS
// =====================================
export async function getOfficerComplaints() {
  // ❌ REMOVE
  // console.info('getOfficerComplaints() called');

  // ❌ REMOVE null
  // return null;

  // ✅ REQUIRED
  const { data } = await apiClient.get('/complaints/assigned');
  return data;
}

// =====================================
//            ALL USERS
// =====================================
export async function getAllUsers() {
  // ❌ REMOVE
  // console.info('getAllUsers() called');
  // return null;

  // ✅ REQUIRED
  const { data } = await apiClient.get('/admin/users');
  return data;
}

// =====================================
//            ADD STAFF
// =====================================
export async function addStaff(payload) {
  const { data } = await apiClient.post('/admin/users', payload);
  return data;
}

// =====================================
//         ALL COMPLAINTS (ADMIN)
// =====================================
export async function getAllComplaints(params = {}) {
  const { data } = await apiClient.get('/admin/complaints', { params });
  return data;
}

export async function getAnalytics() {
  const { data } = await apiClient.get('/admin/analytics');
  return data;
}

export async function getLiveActivity() {
  const { data } = await apiClient.get('/admin/live-activity');
  return data;
}

export async function getUrgentCases() {
  const { data } = await apiClient.get('/admin/urgent-cases');
  return data;
}

export async function getOfficerPerformance() {
  const { data } = await apiClient.get('/admin/officer-performance');
  return data;
}

export async function updateComplaintStatus(complaintId, payload) {
  const { data } = await apiClient.patch(`/complaints/${complaintId}/status`, payload);
  return data;
}

export async function closeComplaint(complaintId, payload) {
  const { data } = await apiClient.post(`/admin/complaints/${complaintId}/close`, payload);
  return data;
}

// =====================================
//              PROFILE
// =====================================
export async function updateProfile(data) {
  const { data: response } = await apiClient.patch('/users/profile', data);
  return response;
}

export async function getProfile() {
  const { data } = await apiClient.get('/users/profile');
  return data;
}

// =====================================
//      DEPARTMENTS & CATEGORIES
// =====================================
export async function getDepartments() {
  const { data } = await apiClient.get('/departments');
  return data;
}

export async function getCategories(departmentId) {
  let url = '/categories';
  if (departmentId) url += `?departmentId=${departmentId}`;
  const { data } = await apiClient.get(url);
  return data;
}

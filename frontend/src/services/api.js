import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://history-packers41.onrender.com/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ACCESS_TOKEN_KEY = 'hp_auth_access_token';
const REFRESH_TOKEN_KEY = 'hp_auth_refresh_token';

let inMemoryToken = null;
try {
  inMemoryToken = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
} catch (e) {
  // Safe storage access
}

export const setAuthToken = (token) => {
  inMemoryToken = token;
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch (e) {}
};

export const getAuthToken = () => {
  if (!inMemoryToken) {
    try {
      inMemoryToken = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    } catch (e) {}
  }
  return inMemoryToken;
};

export const setRefreshToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (e) {}
};

export const getRefreshToken = () => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  } catch (e) {
    return null;
  }
};

export const clearAuthTokens = () => {
  inMemoryToken = null;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (e) {}
};

// Request Interceptor: attach token & handle multipart boundary properly
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For file uploads (FormData), remove static Content-Type so browser sets multipart/form-data with boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Queued refresh token mutex to handle concurrent 401s safely
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: handle 401 token refresh with request queue & persistence
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt token refresh for login/register endpoints or if already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/login') &&
      !originalRequest.url?.includes('/register') &&
      !originalRequest.url?.includes('/refresh')
    ) {
      if (isRefreshing) {
        // Enqueue concurrent requests while refresh is in flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = getRefreshToken();
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );
        const newToken = refreshRes.data.data?.accessToken;
        const newRefreshToken = refreshRes.data.data?.refreshToken;
        if (newToken) {
          setAuthToken(newToken);
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
        processQueue(new Error('No token returned from refresh'), null);
      } catch (refreshErr) {
        clearAuthTokens();
        processQueue(refreshErr, null);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// AUTH API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  logout: () => api.post('/auth/logout', { refreshToken: getRefreshToken() }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ENQUIRY API
export const enquiryAPI = {
  create: (data) => api.post('/enquiries', data),
  getMy: () => api.get('/enquiries/my'),
  getAll: (params) => api.get('/admin/enquiries', { params }),
  getById: (id) => api.get(`/admin/enquiries/${id}`),
  update: (id, data) => api.patch(`/admin/enquiries/${id}`, data),
  convertToBooking: (id, data) => api.post(`/admin/enquiries/${id}/convert`, data),
  delete: (id) => api.delete(`/admin/enquiries/${id}`),
};

// BOOKINGS API
export const bookingAPI = {
  getMy: () => api.get('/bookings/my'),
  getMyById: (id) => api.get(`/bookings/${id}`),
  getAll: (params) => api.get('/admin/bookings', { params }),
  getById: (id) => api.get(`/admin/bookings/${id}`),
  create: (data) => api.post('/admin/bookings', data),
  update: (id, data) => api.patch(`/admin/bookings/${id}`, data),
  delete: (id) => api.delete(`/admin/bookings/${id}`),
};

// SERVICES & CONTENT API
export const contentAPI = {
  getServices: () => api.get('/services'),
  getServiceBySlug: (slug) => api.get(`/services/${slug}`),
  getTestimonials: () => api.get('/testimonials'),
  getGallery: (params) => api.get('/gallery', { params }),
  getHeroCarousel: () => api.get('/hero-carousel'),
  getFAQs: () => api.get('/faqs'),
  getSettings: () => api.get('/settings'),
};

// ADMIN MANAGEMENT API
export const adminAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getActivityLogs: () => api.get('/admin/activity-logs'),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomerById: (id) => api.get(`/admin/customers/${id}`),
  toggleCustomerStatus: (id) => api.patch(`/admin/customers/${id}/toggle-status`),
  
  // Services
  getAdminServices: () => api.get('/admin/services'),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.patch(`/admin/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),

  // Gallery
  getAdminGallery: (params) => api.get('/admin/gallery', { params }),
  createGalleryItem: (data) => api.post('/admin/gallery', data),
  updateGalleryItem: (id, data) => api.patch(`/admin/gallery/${id}`, data),
  deleteGalleryItem: (id) => api.delete(`/admin/gallery/${id}`),
  reorderGallery: (items) => api.patch('/admin/gallery/reorder', { items }),

  // Hero Carousel
  getAdminHeroCarousel: (params) => api.get('/admin/hero-carousel', { params }),
  createHeroCarouselSlide: (data) => api.post('/admin/hero-carousel', data),
  updateHeroCarouselSlide: (id, data) => api.patch(`/admin/hero-carousel/${id}`, data),
  deleteHeroCarouselSlide: (id) => api.delete(`/admin/hero-carousel/${id}`),
  reorderHeroCarousel: (items) => api.patch('/admin/hero-carousel/reorder', { items }),

  // Testimonials
  getAdminTestimonials: () => api.get('/admin/testimonials'),
  createTestimonial: (data) => api.post('/admin/testimonials', data),
  updateTestimonial: (id, data) => api.patch(`/admin/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`),

  // FAQs
  getAdminFAQs: () => api.get('/admin/faqs'),
  createFAQ: (data) => api.post('/admin/faqs', data),
  updateFAQ: (id, data) => api.patch(`/admin/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/admin/faqs/${id}`),

  // Settings
  updateSettings: (data) => api.patch('/admin/settings', data),

  // Uploads
  getUploadStatus: () => api.get('/admin/uploads/status'),
  uploadImage: (formData) => api.post('/admin/uploads', formData),
  uploadMultipleImages: (formData) => api.post('/admin/uploads/multiple', formData),
  deleteImage: (publicId) => api.delete(`/admin/uploads/${encodeURIComponent(publicId)}`),
};

export default api;


/**
 * ReadSphere API Service
 * Communicates with the Express REST API backed by local MongoDB
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const request = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Books API
export const booksApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.genre && params.genre !== 'All') searchParams.append('genre', params.genre);
    if (params.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params.sort) searchParams.append('sort', params.sort);
    const query = searchParams.toString();
    return request(`/books${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/books/${id}`),

  create: (bookData) =>
    request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),

  update: (id, bookData) =>
    request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    }),

  delete: (id) =>
    request(`/books/${id}`, {
      method: 'DELETE',
    }),

  updateProgress: (id, currentPage) =>
    request(`/books/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ currentPage }),
    }),

  markCompleted: (id) =>
    request(`/books/${id}/complete`, {
      method: 'PATCH',
    }),
};

// Reading Sessions API
export const sessionsApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.bookId) searchParams.append('bookId', params.bookId);
    if (params.limit) searchParams.append('limit', params.limit);
    const query = searchParams.toString();
    return request(`/sessions${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/sessions/${id}`),

  create: (sessionData) =>
    request('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),

  update: (id, sessionData) =>
    request(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    }),

  delete: (id) =>
    request(`/sessions/${id}`, {
      method: 'DELETE',
    }),
};

// Reading Goals API
export const goalsApi = {
  getAll: () => request('/goals'),

  create: (goalData) =>
    request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    }),

  update: (id, goalData) =>
    request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    }),

  delete: (id) =>
    request(`/goals/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard & Analytics API
export const dashboardApi = {
  getDashboard: () => request('/dashboard'),
  getAnalytics: () => request('/analytics'),
};

// Health Check API
export const healthApi = {
  checkHealth: () => request('/health'),
};

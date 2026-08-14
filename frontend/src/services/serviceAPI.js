import axiosInstance from './api';

export const authService = {
  register: (userData) => axiosInstance.post('/auth/register', userData),
  login: (email, password) => axiosInstance.post('/auth/login', { email, password }),
  getCurrentUser: () => axiosInstance.get('/auth/me'),
  updateProfile: (userData) => axiosInstance.put('/auth/profile', userData),
  changePassword: (oldPassword, newPassword) => axiosInstance.put('/auth/change-password', { oldPassword, newPassword }),
};

export const taskService = {
  getAllTasks: (params) => axiosInstance.get('/tasks', { params }),
  getTaskById: (id) => axiosInstance.get(`/tasks/${id}`),
  getUserTasks: (params) => axiosInstance.get('/tasks/user/my-tasks', { params }),
  createTask: (taskData) => axiosInstance.post('/tasks', taskData),
  updateTask: (id, taskData) => axiosInstance.put(`/tasks/${id}`, taskData),
  cancelTask: (id) => axiosInstance.put(`/tasks/${id}/cancel`),
  deleteTask: (id) => axiosInstance.delete(`/tasks/${id}`),
  getNearbyTasks: (params) => axiosInstance.get('/tasks/nearby', { params }),
};

export const bookingService = {
  createBooking: (bookingData) => axiosInstance.post('/bookings', bookingData),
  getTaskBookings: (taskId, params) => axiosInstance.get(`/bookings/task/${taskId}`, { params }),
  getWorkerBookings: (params) => axiosInstance.get('/bookings/worker/my-bookings', { params }),
  getBookingById: (id) => axiosInstance.get(`/bookings/${id}`),
  acceptBooking: (id) => axiosInstance.put(`/bookings/${id}/accept`),
  rejectBooking: (id) => axiosInstance.put(`/bookings/${id}/reject`),
  completeBooking: (id) => axiosInstance.put(`/bookings/${id}/complete`),
  cancelBooking: (id) => axiosInstance.put(`/bookings/${id}/cancel`),
};

export const reviewService = {
  createReview: (reviewData) => axiosInstance.post('/reviews', reviewData),
  getUserReviews: (userId, params) => axiosInstance.get(`/reviews/user/${userId}`, { params }),
  getMyReviews: (params) => axiosInstance.get('/reviews/my/reviews', { params }),
  getReviewById: (id) => axiosInstance.get(`/reviews/${id}`),
  updateReview: (id, reviewData) => axiosInstance.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => axiosInstance.delete(`/reviews/${id}`),
};

export const messageService = {
  sendMessage: (messageData) => axiosInstance.post('/messages', messageData),
  getConversations: (params) => axiosInstance.get('/messages/conversations', { params }),
  getBookingMessages: (bookingId, params) => axiosInstance.get(`/messages/booking/${bookingId}`, { params }),
  getUnreadCount: () => axiosInstance.get('/messages/unread/count'),
  markMessageAsRead: (id) => axiosInstance.put(`/messages/${id}/read`),
  markAllAsRead: (bookingId) => axiosInstance.put(`/messages/booking/${bookingId}/read-all`),
};

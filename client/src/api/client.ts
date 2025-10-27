import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CHATBOT_API_BASE_URL || 'http://localhost:4000/api/v1',
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || error.message,
        data: error.response.data,
      });
    }
    return Promise.reject(error);
  },
);

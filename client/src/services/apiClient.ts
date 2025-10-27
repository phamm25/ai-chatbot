import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL,
});

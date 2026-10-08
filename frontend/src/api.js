import axios from 'axios';

// Base URL comes from Vite env variable VITE_API_URL
// Falls back to localhost for development
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export default api;

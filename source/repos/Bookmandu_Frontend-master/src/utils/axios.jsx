import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5036',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default instance; 
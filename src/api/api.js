import axios from 'axios';

// Tạo 1 axios dùng chung, trỏ tới json-server (npm run api)
const api = axios.create({ baseURL: 'http://localhost:3001' });

export default api;

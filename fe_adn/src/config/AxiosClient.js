import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken } from "../Components/Service/refreshAccessToken";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

// ✅ Helper functions
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp && decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// ✅ Flag để tránh multiple logout prompts
let isShowingLogoutPrompt = false;

const showLogoutPrompt = () => {
  if (isShowingLogoutPrompt) return false;
  
  isShowingLogoutPrompt = true;
  
  const userChoice = confirm(
    "Phiên đăng nhập của bạn đã hết hạn!\n\n" +
    "Vui lòng đăng nhập lại để tiếp tục.\n\n"
  );

  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  
  if (userChoice) {
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/') {
      localStorage.setItem('redirectUrl', currentPath);
    }
    window.location.href = "/login";
  }
  
  // Reset flag sau 3 giây
  setTimeout(() => {
    isShowingLogoutPrompt = false;
  }, 3000);
  
  return userChoice;
};

// ✅ Request interceptor - CHỈ attach token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor - Xử lý tất cả ở đây
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 401 error, attempting token refresh...');
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshErr) {
        console.error('❌ Token refresh failed:', refreshErr);
        showLogoutPrompt();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
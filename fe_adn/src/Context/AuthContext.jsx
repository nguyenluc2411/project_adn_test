import React, { createContext, useState, useContext, useEffect, useRef  } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../config/AxiosClient';
import { refreshAccessToken } from '../Components/Service/refreshAccessToken';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRefreshingRef = useRef(isRefreshing);

  // Validate token với jwt-decode
  const validateToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp && decoded.exp > currentTime) {
        return decoded;
      } else {
        console.log('Token expired:', new Date(decoded.exp * 1000));
        return null;
      }
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  };

  const refreshFromCookie = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Attempting to refresh token from cookie...');

      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) return false;
      if (newAccessToken) {
        const decoded = jwtDecode(newAccessToken);

        // ✅ Kiểm tra localStorage có đầy đủ thông tin không
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);

            // ✅ Check có đầy đủ thông tin quan trọng không
            const hasFullData = userData.avatar || userData.picture ||
              userData.profileImage || userData.chatSettings ||
              userData.fullName || userData.displayName;

            if (hasFullData) {
              console.log('✅ Full user data exists in localStorage');

              // ✅ Chỉ update token, giữ nguyên user data
              setIsLoggedIn(true);
              setUser(userData);
              setRole(userData.role);
              localStorage.setItem('accessToken', newAccessToken);

              console.log('✅ Token refreshed, user data preserved');
              return true;
            }
          } catch (parseError) {
            console.warn('⚠️ Error parsing stored user, will fetch fresh');
          }
        }

        // ✅ Gọi API để lấy đầy đủ thông tin
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/account/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newAccessToken}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (response.ok) {
            const fullUserData = await response.json();

            setIsLoggedIn(true);
            setUser(fullUserData);
            setRole(fullUserData.role);
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('user', JSON.stringify(fullUserData));

            console.log('✅ Full profile fetched and stored');
            return true;
          } else {
            console.warn(`⚠️ Profile API failed (${response.status})`);
          }
        } catch (apiError) {
          console.error('❌ Profile API error:', apiError);
        }

        // ✅ Fallback cuối cùng
        const fallbackData = {
          username: decoded.sub || decoded.username,
          role: decoded.role,
          email: decoded.email,
        };

        setIsLoggedIn(true);
        setUser(fallbackData);
        setRole(fallbackData.role);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('user', JSON.stringify(fallbackData));

        console.log('⚠️ Using fallback user data');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Refresh from cookie failed:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // ✅ Flag để tránh multiple logout prompts
  const isShowingLogoutPrompt = useRef(false);

const showLogoutPrompt = () => {
  if (isShowingLogoutPrompt.current) return false;
  isShowingLogoutPrompt.current = true;

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

  setTimeout(() => {
    isShowingLogoutPrompt.current = false;
  }, 3000);

  return userChoice;
};

  // ✅ LOGIC HOÀN TOÀN MỚI - xử lý tất cả trường hợp
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        // ✅ Trường hợp 1: Có token và user trong localStorage
        if (token && storedUser) {
          const decodedToken = validateToken(token);

          if (decodedToken) {
            // Token còn hạn, khôi phục user
            try {
              const userData = JSON.parse(storedUser);
              setIsLoggedIn(true);
              setUser(userData);
              setRole(userData.role);
              console.log('✅ User restored from localStorage:', userData.username);
            } catch (parseError) {
              console.error('❌ Error parsing stored user:', parseError);
              await handleInvalidToken();
            }
          } else {
            // Token hết hạn, thử refresh
            console.log('⏰ Token expired, attempting refresh...');
            const refreshSuccess = await refreshFromCookie();

            if (!refreshSuccess) {
              await handleInvalidToken();
            }
          }
        }
        // ✅ Trường hợp 2: Không có token (F5, reload) nhưng có thể có refreshToken
        else {
          console.log('🔍 No token in localStorage, checking cookie...');
          const refreshSuccess = await refreshFromCookie();

          if (!refreshSuccess) {
            // Không có gì cả hoặc refresh fail
            console.log('👤 No valid session found');
            setIsLoggedIn(false);
            setUser(null);
            setRole(null);
          }
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        await handleInvalidToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('accessToken');
      if (!token || isRefreshingRef.current) return;

      try {
        const decoded = jwtDecode(token);

        // Nếu token đã hết hạn rồi, không cần chờ – xử lý luôn
        if (decoded.exp < Date.now() / 1000) {
          console.warn('⛔ Token đã hết hạn – xử lý đăng xuất ngay');
          await handleInvalidToken();
          return;
        }

        const timeLeft = decoded.exp - Date.now() / 1000;

        if (timeLeft < 20) {
          console.log('🔄 Token gần hết hạn – tự động refresh...');
          const success = await refreshFromCookie();
          if (!success) {
            showLogoutPrompt();
          }
        }
      } catch (err) {
        console.error('❌ Decode token lỗi – đăng xuất', err);
        await handleInvalidToken();
      }
    }, 300000); // check mỗi 60 giây

    return () => clearInterval(interval);
  }, []);

  // Xử lý token không hợp lệ
  const handleInvalidToken = async () => {
    console.log('🧹 Cleaning up invalid session...');
    setIsLoggedIn(false);
    setUser(null);
    setRole(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectUrl');
    showLogoutPrompt();
  };

  // Check token expiry
  const checkTokenExpiry = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    const decodedToken = validateToken(token);
    return !!decodedToken;
  };

  // Get token expiry time
  const getTokenExpiryTime = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  };

  // Login function
  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('user', JSON.stringify(userData));

    console.log('✅ User logged in:', userData.username);

    const expiryTime = getTokenExpiryTime();
    if (expiryTime) {
      console.log('⏰ Token expires at:', expiryTime);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log("🔄 Calling logout API...");
      await axiosClient.post("/api/v1/auth/logout");
      console.log("✅ Logout API success");
    } catch (err) {
      console.error("❌ Logout API error:", err);
    }

    setIsLoggedIn(false);
    setUser(null);
    setRole(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectUrl');

    console.log("🔁 Redirecting to home...");
    window.location.href = '/';
  };

  const checkAuthentication = () => {
    return isLoggedIn && user !== null && checkTokenExpiry();
  };

  const checkLogin = (redirectPath) => {
    if (!checkAuthentication()) {
      localStorage.setItem('redirectUrl', redirectPath);
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        role,
        loading,
        isRefreshing,
        login,
        logout,
        checkLogin,
        checkAuthentication,
        checkTokenExpiry,
        getTokenExpiryTime,
        handleInvalidToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
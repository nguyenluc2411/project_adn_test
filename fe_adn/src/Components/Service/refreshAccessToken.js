export async function refreshAccessToken() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('REFRESH_TOKEN_INVALID');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const accessToken = data.accessToken;

    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  } catch (error) {
    console.error('Refresh token failed:', error);
    throw error;
  }
}
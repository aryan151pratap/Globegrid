import { useState, useEffect, useCallback } from "react";
import { get_user_details, logout, me } from "../../services/authService";

// Change this to your FastAPI backend URL
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Checks with the backend whether the session cookie is still valid.
 * The cookie should be httpOnly, so JS can't read it directly —
 * we ask the server instead (GET /auth/me) and send cookies with credentials: "include".
 *
 * Your FastAPI endpoint should return 200 + user JSON if logged in, 401 otherwise.
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await me();
      if (res.authenticated) {
		const user = await get_user_details(res.user_id);
		if(user) setUser(user.user);
		else setUser(res);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("getUser failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout_site = useCallback(async () => {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  return { user, loading, getUser, logout: logout_site };
}
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { me } from "./services/authService";
import { useAuth } from "./AuthContext";
import { useNotify } from "./components/Device-IDE/notify";
import { PageLoading } from "./pageLoading";

export default function ProtectedRoute() {

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const { setUser } = useAuth();
    const location = useLocation();
    const notify = useNotify();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const response = await me();

            if (response.authenticated) {
                setAuthenticated(true);
                setUser(response);
            } else {
                notify({type: "error", message: response?.message || "Authentication failed"})
                setAuthenticated(false);
                setUser(null);
            }

        } catch (error) {
            notify({type: "error", message: error?.response?.data?.detail || "Authentication failed"})
            console.error(
                "Authentication check failed:",
                error
            );
            setAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }
    if (loading) {
        return <PageLoading/>;
    }
    if (!authenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return <Outlet />;
}
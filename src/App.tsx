import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CakesPage from "./pages/CakesPage";
import FeedbackPage from "./pages/FeedbackPage";
import OffersPage from "./pages/OffersPage";
import OrdersPage from "./pages/OrdersPage";
import UsersPage from "./pages/UsersPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import { getAdminSession } from "./auth";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    void getAdminSession()
      .then((adminSession) => {
        setSession(adminSession);
      })
      .catch((error: unknown) => {
        setAuthError(
          error instanceof Error
            ? error.message
            : "Unable to verify administrator access. Check the API URL and CORS settings.",
        );
      })
      .finally(() => setIsLoading(false));

    return undefined;
  }, []);

  if (isLoading) return null;

  if (authError) {
    return <AdminLoginPage initialError={authError} />;
  }

  if (!session) return <AdminLoginPage />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/users" replace />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/cakes" element={<CakesPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </Layout>
  );
}

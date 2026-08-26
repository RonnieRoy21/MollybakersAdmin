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

  useEffect(() => {
    void getAdminSession().then((adminSession) => {
      setSession(adminSession);
      setIsLoading(false);
    });

    return undefined;
  }, []);

  if (isLoading) return null;

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

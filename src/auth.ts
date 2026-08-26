import { createClient, type Session } from "@supabase/supabase-js";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
const TOKEN_KEY = "mollybakers_admin_access_token";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUB_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are not configured.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function getAdminSession(): Promise<Session | null> {
  const token = getAccessToken();
  if (token) {
    const response = await fetch(`${API_URL}/admin/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) return { access_token: token } as Session;
    localStorage.removeItem(TOKEN_KEY);
    if (response.status === 403) {
      throw new Error("This account does not have administrator access.");
    }
  }

  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return null;

  const response = await fetch(`${API_URL}/admin/session`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!response.ok) {
    await supabase.auth.signOut();
    if (response.status === 403) {
      throw new Error("This account does not have administrator access.");
    }
    return null;
  }

  localStorage.setItem(TOKEN_KEY, session.access_token);
  return session;
}

export async function signInAdmin(email: string, password: string) {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error((await response.text()) || "Unable to sign in.");
  }

  const payload = (await response.json()) as {
    response: { access_token: string };
  };
  localStorage.setItem(TOKEN_KEY, payload.response.access_token);
}

export async function signInWithGoogleAdmin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });

  if (error) throw new Error(error.message);
}

export async function signOutAdmin() {
  localStorage.removeItem(TOKEN_KEY);
}

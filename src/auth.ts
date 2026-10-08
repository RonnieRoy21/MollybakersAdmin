import { createClient, type Session } from "@supabase/supabase-js";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUB_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are not configured.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.access_token ?? null;
}

async function verifyAdminAccess(session: Session): Promise<void> {
  const response = await fetch(`${API_URL}/admin/session`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("This account does not have administrator access.");
    }
    throw new Error("Unable to verify administrator access.");
  }
}

export async function getAdminSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const session = data.session;
  if (!session) return null;

  try {
    await verifyAdminAccess(session);
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }

  return session;
}

export async function signInAdmin(
  email: string,
  password: string,
): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.session) throw new Error("Unable to sign in.");

  try {
    await verifyAdminAccess(data.session);
  } catch (adminError) {
    await supabase.auth.signOut();
    throw adminError;
  }

  return data.session;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

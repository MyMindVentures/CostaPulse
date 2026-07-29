"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPostLoginPath, type AppRole } from "@/server/auth/role-access";

export type SignInResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string };

export type RequestPortalMagicLinkResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const PORTAL_MAGIC_LINK_REDIRECT_PATH =
  "/auth/callback?next=/portal/credentials";

function buildPortalMagicLinkRedirectUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      const origin = new URL(configured).origin;
      return `${origin}${PORTAL_MAGIC_LINK_REDIRECT_PATH}`;
    } catch {
      // Fall through to localhost fallback.
    }
  }

  return `http://localhost:3000${PORTAL_MAGIC_LINK_REDIRECT_PATH}`;
}

function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function signInWithPasswordAction(input: {
  email: string;
  password: string;
}): Promise<SignInResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Authentication is not configured." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    return { ok: false, message: "Invalid email or password." };
  }

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("profile_id", data.user.id);

  const roles = (roleRows ?? []).map((row) => row.role as AppRole);
  return { ok: true, redirectTo: getPostLoginPath(roles) };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function requestPortalMagicLinkAction(input: {
  email: string;
}): Promise<RequestPortalMagicLinkResult> {
  const email = input.email.trim().toLowerCase();
  if (!isPlausibleEmail(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Authentication is not configured." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: buildPortalMagicLinkRedirectUrl()
    }
  });

  if (error) {
    return {
      ok: true,
      message:
        "If this address is eligible for access, a fresh magic link has been sent."
    };
  }

  return {
    ok: true,
    message:
      "If this address is eligible for access, a fresh magic link has been sent."
  };
}

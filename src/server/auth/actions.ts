"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPostLoginPath, type AppRole } from "@/server/auth/role-access";

export type SignInResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string };

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

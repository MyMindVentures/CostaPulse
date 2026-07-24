import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminDashboardSnapshot = {
  dataConnected: boolean;
  metrics: {
    bookings: number;
    users: number;
    experiences: number;
  };
};

export async function getAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      dataConnected: false,
      metrics: { bookings: 0, users: 0, experiences: 0 }
    };
  }

  const [bookings, users, experiences] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("experiences").select("id", { count: "exact", head: true })
  ]);

  const hasError = [bookings, users, experiences].some(
    (result) => result.error
  );

  return {
    dataConnected: !hasError,
    metrics: {
      bookings: bookings.count ?? 0,
      users: users.count ?? 0,
      experiences: experiences.count ?? 0
    }
  };
}

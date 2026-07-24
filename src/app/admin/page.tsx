import { AdminDashboardFeature } from "@/features/admin/admin-dashboard";

export const metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false }
};

export default function AdminPage() {
  return <AdminDashboardFeature />;
}

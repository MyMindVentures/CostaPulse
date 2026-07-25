import { notFound, redirect } from "next/navigation";
import { BookingStoryEditor } from "@/features/admin/booking-story-editor";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canMutateAdminContent } from "@/server/auth/role-access";
import {
  getAdminBookingStory,
  getBookingFootageUploadPolicy
} from "@/server/repositories/admin-booking-stories";

export const metadata = {
  title: "Edit booking story",
  robots: { index: false, follow: false }
};

export default async function BookingStoryEditorPage({
  params
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { roles } = await requireAreaAccess("admin");
  if (!canMutateAdminContent(roles)) redirect("/admin?auth=forbidden");
  const { storyId } = await params;
  const [detail, uploadPolicy] = await Promise.all([
    getAdminBookingStory(storyId),
    getBookingFootageUploadPolicy()
  ]);
  if (!detail) notFound();
  return <BookingStoryEditor detail={detail} uploadPolicy={uploadPolicy} />;
}

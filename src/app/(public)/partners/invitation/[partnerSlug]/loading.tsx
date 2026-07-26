import { getTranslations } from "next-intl/server";
import { LoadingState } from "@/components/shared/loading-state";

export default async function InvitationLoading() {
  const t = await getTranslations("PartnerInvitation");
  return (
    <main
      className="bg-navy-deep grid min-h-[70svh] place-items-center p-6"
      aria-busy="true"
    >
      <LoadingState label={t("loading")} />
    </main>
  );
}

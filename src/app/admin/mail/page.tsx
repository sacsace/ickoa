import { redirect } from "next/navigation";
import { AdminMailSettings } from "@/components/admin/admin-mail-settings";
import { auth } from "@/lib/auth";
import { getOrCreateMailSetting, toPublicMailSetting } from "@/lib/mail";
import { adminHasRole } from "@/lib/session-kind";

export const dynamic = "force-dynamic";

export default async function AdminMailPage() {
  const session = await auth();
  if (!adminHasRole(session, ["SUPER_ADMIN"])) {
    redirect("/admin");
  }

  const setting = await getOrCreateMailSetting();

  return <AdminMailSettings initial={toPublicMailSetting(setting)} />;
}

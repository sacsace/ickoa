import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { AccountForm } from "@/components/account/account-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteUser } from "@/lib/session-kind";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "내 정보",
  description: "회원 정보 수정",
  path: "/account",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/account")}`);
  }

  const user = await prisma.user.findUnique({
    where: { id: siteUser.id },
    select: {
      name: true,
      nameEn: true,
      email: true,
      loginId: true,
      phone: true,
      address: true,
      company: true,
      jobTitle: true,
      image: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader title="내 정보" subtitle="회원 정보를 확인하고 수정할 수 있습니다" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <AccountForm
          initial={{
            name: user.name ?? "",
            nameEn: user.nameEn ?? "",
            email: user.email ?? "",
            loginId: user.loginId,
            phone: user.phone ?? "",
            address: user.address ?? "",
            company: user.company ?? "",
            jobTitle: user.jobTitle ?? "",
            image: user.image,
          }}
        />
      </div>
    </>
  );
}

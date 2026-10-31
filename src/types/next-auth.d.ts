import type { DefaultSession } from "next-auth";

type PortalUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  loginId?: string | null;
};

declare module "next-auth" {
  interface Session {
    /** @deprecated 호환용. 사이트는 site, 관리자는 admin을 우선 사용 */
    sessionKind?: "site" | "admin";
    site?: PortalUser | null;
    admin?: PortalUser | null;
    user: {
      id: string;
      role: string;
      loginId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    loginId?: string | null;
    sessionKind?: "site" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    sessionKind?: "site" | "admin";
    siteId?: string;
    siteName?: string | null;
    siteEmail?: string | null;
    siteImage?: string | null;
    siteRole?: string;
    siteLoginId?: string | null;
    adminId?: string;
    adminName?: string | null;
    adminEmail?: string | null;
    adminImage?: string | null;
    adminRole?: string;
    adminLoginId?: string | null;
  }
}

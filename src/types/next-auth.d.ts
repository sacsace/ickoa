import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    sessionKind?: "site" | "admin";
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    sessionKind?: "site" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    sessionKind?: "site" | "admin";
  }
}

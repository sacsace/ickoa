import { Suspense } from "react";
import LoginForm from "./login-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "로그인",
  description: "KAIC 커뮤니티 회원 로그인",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

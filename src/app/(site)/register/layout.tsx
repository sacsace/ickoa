import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "회원가입",
  description: "ICKOA 첸나이 한인회 커뮤니티 회원 가입",
  path: "/register",
  noIndex: true,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

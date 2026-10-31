import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NewGuesthouseGuideRedirectPage() {
  redirect("/guide/c/guesthouse/new");
}
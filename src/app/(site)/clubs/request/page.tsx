import { redirect } from "next/navigation";

export default function ClubRequestRedirectPage() {
  redirect("/clubs/new");
}

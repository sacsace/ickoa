import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function RestaurantsGuideRedirectPage() {
  redirect("/guide/c/restaurant");
}

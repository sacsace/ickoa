"use server";

export async function getPostLoginPath(
  callbackUrl?: string | null,
) {
  if (
    callbackUrl?.startsWith("/") &&
    !callbackUrl.startsWith("/admin") &&
    callbackUrl !== "/login"
  ) {
    return callbackUrl;
  }

  return "/";
}

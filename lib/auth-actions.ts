"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

// Only allow redirects back into this site ("/meetings/new"), never to
// another site ("//evil.com" or "https://...").
function safeRedirect(target: FormDataEntryValue | null): string {
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//")
    ? target
    : "/meetings";
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: safeRedirect(formData.get("redirectTo")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === "CredentialsSignin"
        ? "Invalid email or password."
        : "Something went wrong. Please try again.";
    }
    // A successful sign-in "throws" a redirect; let Next.js handle it.
    throw error;
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

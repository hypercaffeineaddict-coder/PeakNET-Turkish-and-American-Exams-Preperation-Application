"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  // Check if email is verified
  if (data.user && !data.user.email_confirmed_at) {
    redirect("/verify-email?redirect=" + encodeURIComponent("/dashboard"));
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    options: {
      data: { display_name: String(formData.get("name") ?? "") },
    },
  });
  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);

  // After signup, redirect to verify email page
  if (data.user && !data.user.email_confirmed_at) {
    redirect("/verify-email?redirect=" + encodeURIComponent("/onboarding"));
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
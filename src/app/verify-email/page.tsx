"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [status, setStatus] = useState<"checking" | "verified" | "unverified" | "error">("checking");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    checkVerification();
  }, []);

  const checkVerification = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setEmail(user.email || "");

    if (user.email_confirmed_at) {
      setStatus("verified");
      router.push(redirectTo);
    } else {
      setStatus("unverified");
    }
  };

  const resendEmail = async () => {
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) {
      setStatus("error");
    } else {
      // Show success briefly, then back to unverified
      setStatus("unverified");
    }
    setResending(false);
  };

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "verified") {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">E-posta Doğrulama</CardTitle>
          <p className="text-muted-foreground">
            Hesabınızı aktifleştirmek için e-posta adresinizi doğrulayın.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Şu adrese doğrulama e-postası gönderildi:</p>
            <p className="font-medium truncate">{email}</p>
          </div>

          <div className="space-y-3">
            <Button className="w-full" onClick={resendEmail} disabled={resending}>
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                "Tekrar Gönder"
              )}
            </Button>

            <Button variant="outline" className="w-full" onClick={checkVerification}>
              Doğruladım, Devam Et
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            E-posta gelmedi mi? Spam klasörünü kontrol edin veya{" "}
            <button onClick={resendEmail} className="underline hover:text-primary">
              tekrar gönderin
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
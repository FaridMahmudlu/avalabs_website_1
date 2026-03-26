"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();

    if (!res.ok) {
      const msg = data.error?.email?.[0] ?? data.error ?? "Giriş başarısız.";
      setSubmitError(msg);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  function fillDemo() {
    form.setValue("email", "demo@avalabs.com");
    form.setValue("password", "demo123");
  }

  return (
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tekrar Hoş Geldiniz
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hesabınıza giriş yaparak araçlarınıza devam edin
        </p>
      </div>

      {/* Demo account hint */}
      <button
        type="button"
        onClick={fillDemo}
        className="mb-6 flex w-full items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-left transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 group"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">Demo Hesabıyla Deneyin</div>
          <div className="text-xs text-muted-foreground">
            demo@avalabs.com / demo123
          </div>
        </div>
        <ArrowRight className="ml-auto h-4 w-4 text-primary/50 transition-transform group-hover:translate-x-1" />
      </button>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {submitError && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">E-posta</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    className="h-11 rounded-lg border-border bg-secondary/30 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium text-foreground">Şifre</FormLabel>
                  <Link href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">
                    Şifremi Unuttum
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 rounded-lg border-border bg-secondary/30 pr-10 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="btn-press h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/15 transition-all duration-300"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Giriş yapılıyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Giriş Yap
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </Form>

      {/* Footer */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 w-full">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">veya</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Yeni hesap oluşturun
          </Link>
        </p>
      </div>
    </div>
  );
}

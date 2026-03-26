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
import { UserPlus, ArrowRight, Eye, EyeOff, Check } from "lucide-react";

const schema = z.object({
  username: z.string().min(2, "Kullanıcı adı en az 2 karakter olmalı").max(32),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type FormValues = z.infer<typeof schema>;

const BENEFITS = [
  "Yapay zeka destekli video planlama",
  "Detaylı video skor analizi",
  "Sınırsız içerik havuzu erişimi",
];

export default function RegisterPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();

    if (!res.ok) {
      const firstError =
        data.error?.username?.[0] ??
        data.error?.email?.[0] ??
        data.error?.password?.[0] ??
        data.error ??
        "Kayıt başarısız.";
      setSubmitError(
        typeof firstError === "string" ? firstError : firstError[0] ?? "Kayıt başarısız."
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Hesap Oluşturun
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Araçlarımıza hemen erişmek için hesabınızı oluşturun
        </p>
      </div>

      {/* Benefits */}
      <div className="mb-6 flex flex-col gap-2">
        {BENEFITS.map((b) => (
          <div key={b} className="flex items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check className="h-3 w-3" />
            </div>
            <span className="text-xs text-muted-foreground">{b}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">Kullanıcı Adı</FormLabel>
                <FormControl>
                  <Input
                    placeholder="kullaniciadi"
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
                <FormLabel className="text-sm font-medium text-foreground">Şifre</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="En az 6 karakter"
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
                Kaydediliyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Kayıt Ol
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground/70">
            Kayıt olarak{" "}
            <Link href="#" className="underline hover:text-foreground">Kullanım Koşulları</Link>{" "}
            ve{" "}
            <Link href="#" className="underline hover:text-foreground">Gizlilik Politikası</Link>
            &apos;nı kabul etmiş olursunuz.
          </p>
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
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
}

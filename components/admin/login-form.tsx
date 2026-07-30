"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, TriangleAlert } from "lucide-react";

import { signInWithPassword } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signInWithPassword(email, password);

    if (error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
      className="mt-8 space-y-4"
    >
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-gray-text">E-mail</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-text" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="pl-10"
            autoComplete="email"
            required
          />
        </div>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-gray-text">Senha</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-text" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-10"
            autoComplete="current-password"
            required
          />
        </div>
      </label>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-status-ocupado-light px-3.5 py-2.5 text-sm text-status-ocupado">
          <TriangleAlert className="size-4 shrink-0" strokeWidth={1.75} />
          {error}
        </div>
      )}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          className="text-sm text-gray-text transition-colors duration-200 hover:text-primary"
        >
          Esqueci minha senha
        </button>
      </div>
    </motion.form>
  );
}

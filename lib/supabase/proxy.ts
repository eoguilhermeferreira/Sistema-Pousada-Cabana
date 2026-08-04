import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { podeAcessarRota } from "@/lib/permissions";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.includes(pathname);

  if (!user && !isPublicAdminPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user && isPublicAdminPath) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // Achado #4 da auditoria: restrição por cargo existia só na Sidebar (o
  // link nem aparecia), mas nada impedia acessar a URL direto — qualquer
  // staff logado (até "limpeza") abria /admin/financeiro, /admin/caixa etc.
  // digitando a URL. Agora o próprio middleware barra, pra toda rota
  // protegida, com base no cargo real do usuário.
  if (user && pathname !== "/admin" && !isPublicAdminPath) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("cargo")
      .eq("id", user.id)
      .single();

    // Sem linha em "usuarios" (ex.: conta de cliente do site) não é staff —
    // manda pro login, nunca pro dashboard, pra não entrar em loop de
    // redirecionamento.
    if (!usuario) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }

    if (pathname !== "/admin/dashboard" && !podeAcessarRota(usuario.cargo, pathname)) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/admin/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response;
}

import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — tests server-to-server reachability of the
// Supabase auth endpoint from Vercel's network, to isolate whether a login
// failure is client-side (browser/network) or server-side (Supabase
// project). Delete after diagnosis.
export async function GET() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      },
      body: JSON.stringify({
        email: "pousadacabana.admin@gmail.com",
        password: "PousadaCabanaAvare26",
      }),
    });
    const text = await res.text();
    return NextResponse.json({
      reachedSupabase: true,
      status: res.status,
      ok: res.ok,
      durationMs: Date.now() - start,
      body: text.slice(0, 500),
      urlUsed: url,
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
  } catch (e) {
    return NextResponse.json(
      {
        reachedSupabase: false,
        error: String(e),
        durationMs: Date.now() - start,
        urlUsed: url,
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      },
      { status: 500 },
    );
  }
}

import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/site-header";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // soft redirect to login
        window.location.href = "/login";
      } else {
        setAuthed(true);
      }
      setChecking(false);
    });
  }, []);

  if (checking || !authed) return <div className="min-h-screen" aria-hidden />;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="pt-28 pb-12 mx-auto max-w-7xl px-4 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

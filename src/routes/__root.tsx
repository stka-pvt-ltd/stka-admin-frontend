import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import appCss from "../styles.css?url";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#29352F] px-4 text-[#F5F7F5]">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-[#8FB59D]">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page Not Found</h2>
        <p className="mt-2 text-sm text-[#C8DACD]">
          The requested admin section does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-[#5F9472] px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-[#5F9472]/90"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#29352F] px-4 text-[#F5F7F5]">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Admin System Exception</h1>
        <p className="mt-2 text-sm text-[#C8DACD]">
          An exception occurred while processing this admin view.
        </p>
        {error?.message && (
          <div className="mt-3 p-3 bg-rose-950/40 border border-rose-800/40 rounded text-xs text-rose-300 font-mono text-left overflow-x-auto">
            {error.message}
          </div>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-[#5F9472] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5F9472]/90"
          >
            Retry Action
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "STKA Admin" },
      { name: "description", content: "Administrative management portal for STKA Pvt Ltd pharmaceutical operations." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AdminAuthGuard />
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

function AdminAuthGuard() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, isLoginPage, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7F5] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#5F9472]" />
        <p className="text-sm font-medium text-[#5A6B62]">Verifying Admin Session...</p>
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="max-w-sm text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Authentication Required</h2>
          <p className="text-xs text-slate-400">
            You must be signed in with administrator credentials to access the STKA management portal.
          </p>
          <Button onClick={() => navigate({ to: "/login" })} className="w-full">
            Sign In to Admin
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

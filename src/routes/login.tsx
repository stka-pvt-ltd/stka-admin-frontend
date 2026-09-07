import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/lib/admin-auth";
import { Lock, Mail, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "STKA Admin" },
      { name: "description", content: "Secure admin sign-in for STKA Pvt Ltd management portal." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password.trim()) {
      setErrorMsg("Please enter both email/phone and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await login({
        emailOrPhone: emailOrPhone.trim(),
        password: password.trim(),
      });
      // Navigation is handled safely by useEffect when isAuthenticated updates to true
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email/phone or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#29352F] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-foreground">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#5F9472_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-2xl bg-white/10 p-2 flex items-center justify-center shadow-xl border border-white/20 backdrop-blur">
            <img src="/favicon.svg" alt="STKA Admin" className="h-full w-auto object-contain" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#F5F7F5] flex items-center justify-center gap-2">
          <span>STKA</span>
          <span className="text-[#8FB59D] font-normal">Admin Portal</span>
        </h2>
        <p className="mt-1 text-center text-xs text-[#C8DACD]">
          Pharmaceutical Administrative & Operational Controls
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Card className="border-[#3d4e46] bg-[#29352F]/90 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-[#F5F7F5]">Sign In</CardTitle>
            <CardDescription className="text-[#C8DACD] text-xs">
              Enter your admin credentials to access the portal dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <Alert variant="destructive" className="bg-rose-950/40 border-rose-800/50 text-rose-200">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  <AlertTitle className="text-xs font-semibold">Authentication Failed</AlertTitle>
                  <AlertDescription className="text-xs text-rose-300">{errorMsg}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="emailOrPhone" className="text-xs font-medium text-[#F5F7F5]">
                  Email Address or Phone Number
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#8FB59D]" />
                  <Input
                    id="emailOrPhone"
                    type="text"
                    placeholder="admin@stkapvt.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-9 bg-[#1f2824] border-[#3d4e46] text-[#F5F7F5] placeholder:text-[#5a6b62] focus:border-[#5F9472] focus:ring-[#5F9472] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-[#F5F7F5]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#8FB59D]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-9 bg-[#1f2824] border-[#3d4e46] text-[#F5F7F5] placeholder:text-[#5a6b62] focus:border-[#5F9472] focus:ring-[#5F9472] text-sm"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#5F9472] hover:bg-[#5F9472]/90 text-white font-semibold text-sm h-10 shadow-md transition-all border-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Credentials...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Sign In to Admin
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between w-full pt-2 text-xs text-[#C8DACD]">
                <a href="https://stkapvt.com" target="_blank" rel="noreferrer" className="inline-flex items-center hover:text-white transition-colors">
                  Public Website &rarr;
                </a>
                <span className="text-[10px] text-[#8FB59D]">STKA Admin Portal v1.0</span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}


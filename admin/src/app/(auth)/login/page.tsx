"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Activity } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { setCredentials } from "@/lib/store/slices/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        localStorage.setItem("refresh_token", refreshToken);
        dispatch(setCredentials({ token: accessToken, user }));
        toast.success(`Welcome back, ${user.name}!`);
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-neutral-50)" }}>
      {/* Left Panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{ background: "var(--sidebar-bg)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold">PhysioAdmin</p>
            <p className="text-slate-400 text-xs">Super Admin Panel</p>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Manage your entire<br />clinic network<br />
            <span className="text-blue-400">from one place.</span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-sm">
            Monitor subscriptions, track revenue, and oversee all clinics in your PhysioSaaS platform.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Clinics Managed", val: "50+" },
              { label: "Monthly Revenue", val: "₨2M+" },
              { label: "Active Patients", val: "5K+" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p className="text-2xl font-bold text-white">{s.val}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-500 text-xs">© 2026 PhysioSaaS. All rights reserved.</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">PhysioAdmin</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
              Welcome back
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-neutral-400)" }}>
              Sign in to your Super Admin account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-neutral-600)" }}>
                Email address
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="admin@physiosaaas.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                style={{ borderColor: errors.email ? "var(--color-danger)" : "var(--color-neutral-200)" }}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-neutral-600)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-11 text-sm rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                  style={{ borderColor: errors.password ? "var(--color-danger)" : "var(--color-neutral-200)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
              style={{ background: "var(--color-primary-600)" }}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

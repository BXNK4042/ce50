"use client";

import { useState } from "react";

interface LoginFormProps {
  lang: string;
}

export default function LoginForm({ lang }: LoginFormProps) {
  const isTh = lang === "th";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/${lang}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        window.location.href = `/${lang}/admin/news`;
      } else {
        setError(isTh ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" : "Invalid username or password");
      }
    } catch (err) {
      setError(isTh ? "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" : "Connection error, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-none text-sm text-center">
          {error}
        </div>
      )}

      {/* Username / Email Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white uppercase tracking-wider">
          {isTh ? "ชื่อผู้ใช้ หรือ อีเมล" : "Username or Email"}
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={isTh ? "ระบุชื่อผู้ใช้หรืออีเมล" : "Enter username or email"}
          required
          className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#e55300] focus:border-[#e55300] transition-all"
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white uppercase tracking-wider">
          {isTh ? "รหัสผ่าน" : "Password"}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full pl-4 pr-12 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#e55300] focus:border-[#e55300] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors focus:outline-none"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Remember Me Option */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer select-none uppercase tracking-wider">
          <input
            type="checkbox"
            className="rounded-none border-zinc-300 dark:border-zinc-800 text-[#e55300] focus:ring-[#e55300] dark:bg-zinc-900"
          />
          {isTh ? "จดจำฉัน" : "Remember me"}
        </label>
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#e55300] hover:bg-[#c94800] text-white font-bold rounded-none transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed uppercase tracking-wider"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          isTh ? "เข้าสู่ระบบ" : "Sign In"
        )}
      </button>

      {/* Divider line and bottom links */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="border-t border-zinc-400 dark:border-zinc-700 w-full" />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-1">
          <div className="text-left">
            <a
              href="#"
              className="text-xs font-semibold text-[#f5945c] underline underline-offset-4 decoration-1 uppercase tracking-wider"
            >
              {isTh ? "ลืมรหัสผ่าน?" : "Forgot password?"}
            </a>
          </div>
          <div className="h-4 border-l border-zinc-400 dark:border-zinc-700" />
          <div className="text-right">
            <a
              href="#"
              className="text-xs font-semibold text-[#f5945c] underline underline-offset-4 decoration-1 uppercase tracking-wider"
            >
              {isTh ? "สมัครสมาชิก" : "Register"}
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}

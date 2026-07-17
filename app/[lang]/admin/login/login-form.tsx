"use client";

import { useState } from "react";

interface LoginFormProps {
  lang: string;
}

export default function LoginForm({ lang }: LoginFormProps) {
  const isTh = lang === "th";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#e55300] focus:border-[#e55300] transition-all"
        />
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
        <div className="border-t border-zinc-200 dark:border-zinc-800/80 w-full" />
        <div className="flex justify-between items-center px-1">
          <a
            href="#"
            className="text-xs font-semibold text-[#e55300] hover:underline uppercase tracking-wider"
          >
            {isTh ? "ลืมรหัสผ่าน?" : "Forgot password?"}
          </a>
          <a
            href="#"
            className="text-xs font-semibold text-[#e55300] hover:underline uppercase tracking-wider"
          >
            {isTh ? "สมัครสมาชิก" : "Register"}
          </a>
        </div>
      </div>
    </form>
  );
}

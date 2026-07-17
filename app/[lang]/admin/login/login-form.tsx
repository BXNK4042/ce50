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
      // Submit username/email and password to the login API
      const res = await fetch(`/${lang}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        window.location.href = `/${lang}/admin/news`; // Redirect to admin dashboard on success
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-8">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {/* Username / Email Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {isTh ? "ชื่อผู้ใช้ หรือ อีเมล" : "Username or Email"}
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={isTh ? "ระบุชื่อผู้ใช้หรืออีเมล" : "Enter username or email"}
          required
          className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#4483cc] focus:border-[#4483cc] transition-all"
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {isTh ? "รหัสผ่าน" : "Password"}
          </label>
          <a
            href="#"
            className="text-xs font-medium text-[#4483cc] hover:underline"
          >
            {isTh ? "ลืมรหัสผ่าน?" : "Forgot password?"}
          </a>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#4483cc] focus:border-[#4483cc] transition-all"
        />
      </div>

      {/* Remember Me Option */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-zinc-300 text-[#4483cc] focus:ring-[#4483cc] dark:bg-zinc-900 dark:border-zinc-800"
          />
          {isTh ? "จดจำฉัน" : "Remember me"}
        </label>
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#4483cc] hover:bg-[#3572b8] text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          isTh ? "เข้าสู่ระบบ" : "Sign In"
        )}
      </button>
    </form>
  );
}

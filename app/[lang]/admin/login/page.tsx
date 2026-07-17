import LoginForm from "./login-form";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <main className="w-full min-h-[85vh] flex items-center justify-center px-6 py-12 md:py-20 relative">
      {/* Decorative blurred backgrounds for premium look */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#4483cc]/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Tall Rectangular Form Card Container */}
      <div className="w-full max-w-md bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider text-center text-zinc-900 dark:text-white uppercase">
          LOGIN
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-3 font-medium">
          {lang === "th" ? "ยินดีต้อนรับกลับมา! กรุณากรอกข้อมูลของคุณ" : "Welcome back! Please enter your details"}
        </p>

        <LoginForm lang={lang} />
      </div>
    </main>
  );
}

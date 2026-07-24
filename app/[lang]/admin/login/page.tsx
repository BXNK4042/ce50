import LoginForm from "./login-form";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <main className="w-full min-h-[85vh] flex items-center justify-center px-6 py-12 md:py-20 relative dark:bg-zinc-800">
      {/* Decorative blurred backgrounds for premium look */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#e55300]/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Wrapper to stack elements vertically */}
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* LOGIN heading placed above/outside the card container, dynamically responsive to light/dark themes */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider text-center text-zinc-900 dark:text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          LOGIN
        </h1>

        {/* Form Card Container */}
        <div className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-8 md:p-10 shadow-2xl backdrop-blur-md">
          <LoginForm lang={lang} />
        </div>
      </div>
    </main>
  );
}

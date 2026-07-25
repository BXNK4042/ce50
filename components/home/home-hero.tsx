interface HomeHeroProps {
  title: string;
}

export function HomeHero({ title }: HomeHeroProps) {
  return (
    <section className="relative w-full flex flex-col items-center justify-center text-center min-h-[calc(100vh-76px)] overflow-hidden">
      <div className="relative z-10 h-[450px] w-[450px] flex items-center justify-center transition-transform duration-300 hover:scale-105 group select-none">
        <img
          src="/ce_logo.webp"
          alt="CE Logo"
          className="h-full w-full object-contain"
        />
        <h1 className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold tracking-tight text-white whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]">
          {title}
        </h1>
      </div>
    </section>
  );
}

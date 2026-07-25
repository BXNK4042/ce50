interface TeachersHeaderProps {
  isTh: boolean;
}

export function TeachersHeader({ isTh }: TeachersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-zinc-900 dark:text-white">
        {isTh ? (
          <>
            วิศวกรรมคอมพิวเตอร์
            <br />
            <span className="text-[#4483cc]">
              <span className="relative inline-block">
                คณา
                <span className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#4483cc] rounded-full" />
              </span>
              จารย์
            </span>{" "}
            ปี 2026
          </>
        ) : (
          <>
            COMPUTER ENGINEERING
            <br />
            <span className="text-[#4483cc]">
              <span className="relative inline-block">
                FAC
                <span className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#4483cc] rounded-full" />
              </span>
              ULTY
            </span>{" "}
            2026
          </>
        )}
      </h1>
    </div>
  );
}

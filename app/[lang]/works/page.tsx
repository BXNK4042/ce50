import { getDictionary, Locale } from "@/app/[lang]/dictionaries";
import WorksGallery, { WorkItem } from "@/components/works/works-gallery";
import { api } from "@/lib/api";
import { Work } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WorksPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  let dbWorks: Work[] = [];
  try {
    dbWorks = await api.works();
  } catch (e) {
    console.error("Failed to fetch works from database:", e);
  }

  // Map database Work items to WorkItem format for WorksGallery
  const dbItems: WorkItem[] = (dbWorks || []).map((item) => {
    const isComp = (item as any).type === "competition" || item.scope === "branch";
    let imageUrl = item.image || "";
    if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
      imageUrl = `/image/works/${imageUrl}`;
    }
    if (!imageUrl) {
      imageUrl = isComp ? "/works/drone.jpg" : "/works/shuttle.jpg";
    }

    return {
      id: `db-${item.id}`,
      type: isComp ? "competition" : "project",
      title_en: item.title,
      title_th: item.title,
      image: imageUrl,
      year: String(item.year || 2025),
      badge_en: isComp ? "Competition Award" : "Student Project",
      badge_th: isComp ? "ผลงานการแข่งขัน" : "โครงงานนักศึกษา",
      summary_en: item.description || "",
      summary_th: item.description || "",
      description_en: item.description || "",
      description_th: item.description || "",
      team: item.author_ids ? [`Student IDs: ${item.author_ids}`] : ["CE Team"],
      tech: ["Computer Engineering", item.scope || "CE"],
    };
  });

  return (
    <section className="w-full px-12 md:px-16 py-12 md:py-16">
      <h1 className="text-3xl md:text-5xl font-extrabold text-center text-blue-950 dark:text-white tracking-tight">
        {dict.works.title}
      </h1>
      {dict.works.subtitle && (
        <p className="mt-2 text-zinc-500 text-center">{dict.works.subtitle}</p>
      )}
      <WorksGallery lang={lang} dict={dict.works} dbItems={dbItems} />
    </section>
  );
}

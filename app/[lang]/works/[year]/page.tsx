export default async function WorksByYearPage({
  params,
}: PageProps<"/[lang]/works/[year]">) {
  const { year } = await params;
  return (
    <section className="mx-auto max-w-5xl px-12 md:px-16 py-12 md:py-16">
      <h1 className="text-3xl font-semibold">Works — Year {year}</h1>
    </section>
  );
}

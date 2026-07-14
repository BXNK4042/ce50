export default async function WorksByYearPage({
  params,
}: PageProps<"/[lang]/works/[year]">) {
  const { year } = await params;
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Works — Year {year}</h1>
    </section>
  );
}

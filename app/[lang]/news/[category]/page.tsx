export default async function NewsByCategoryPage({
  params,
}: PageProps<"/[lang]/news/[category]">) {
  const { category } = await params;
  return (
    <section className="mx-auto max-w-5xl px-12 md:px-16 py-12 md:py-16">
      <h1 className="text-3xl font-semibold capitalize">News — {category}</h1>
    </section>
  );
}

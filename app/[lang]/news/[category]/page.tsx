export default async function NewsByCategoryPage({
  params,
}: PageProps<"/[lang]/news/[category]">) {
  const { category } = await params;
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold capitalize">News — {category}</h1>
    </section>
  );
}

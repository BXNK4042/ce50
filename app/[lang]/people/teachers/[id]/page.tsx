export default async function TeacherDetailPage({
  params,
}: PageProps<"/[lang]/people/teachers/[id]">) {
  const { id } = await params;
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Teacher {id}</h1>
    </section>
  );
}

import AdminTeachersClient from "./admin-teachers-client";

export const dynamic = "force-dynamic";

export default async function AdminTeachersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminTeachersClient lang={lang} />;
}

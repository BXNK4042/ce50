import { redirect } from "next/navigation";

export default async function PeopleAdminRedirect({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(`/${lang}/admin?tab=students`);
}

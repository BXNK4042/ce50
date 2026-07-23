import { redirect } from "next/navigation";

export default async function WorksAdminRedirect({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(`/${lang}/admin?tab=works`);
}

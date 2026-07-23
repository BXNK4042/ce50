import { redirect } from "next/navigation";

export default async function ExamScheduleAdminRedirect({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(`/${lang}/admin?tab=schedules_exam`);
}

import EditorPage from "../../editor";

interface EditNewsPageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { lang, id } = await params;
  return <EditorPage lang={lang} newsId={id} />;
}

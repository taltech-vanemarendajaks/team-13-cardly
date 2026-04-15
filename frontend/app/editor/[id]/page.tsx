import { CardEditor } from "@/components/card/card-editor";

type EditorByIdPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditorByIdPage({ params }: EditorByIdPageProps) {
  const { id } = await params;

  return <CardEditor mode="edit" cardId={id} />;
}

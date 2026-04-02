import { CardEditor } from "@/components/card/card-editor";

type EditorByIdPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditorByIdPage({ params }: EditorByIdPageProps) {
  const { id } = await params;

  return (
    <CardEditor
      mode="edit"
      cardId={id}
      initialDraft={{
        id,
        title: `Card ${id.slice(0, 6)}`,
        templateId: "thank-you",
        background: "linear-gradient(135deg, #e0f2fe, #dbeafe)",
        elements: [
          {
            id: "demo-1",
            content: "Thanks for everything!",
            fontFamily: "Georgia",
            fontSize: 36,
            color: "#0f172a",
            x: 120,
            y: 140
          },
          {
            id: "demo-2",
            content: "- Cardly Team",
            fontFamily: "Arial",
            fontSize: 24,
            color: "#1d4ed8",
            x: 220,
            y: 230
          }
        ]
      }}
    />
  );
}

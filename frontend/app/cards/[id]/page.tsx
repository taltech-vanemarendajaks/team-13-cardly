import { notFound } from "next/navigation";

type CardElement = {
  id?: string;
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  x?: number;
  y?: number;
};

type CardResponse = {
  id: string;
  title: string;
  content?: {
    background?: string;
    backgroundImageUrl?: string;
    elements?: CardElement[];
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type PublicCardPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicCardPage({ params }: PublicCardPageProps) {
  const { id } = await params;
  const response = await fetch(`${API_BASE_URL}/cards/${id}/public`, {
    cache: "no-store"
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Card unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">
            This card is private, password-protected, or scheduled for later.
          </p>
        </div>
      </main>
    );
  }

  const card = (await response.json()) as CardResponse;
  const elements = card.content?.elements ?? [];
  const background = card.content?.background ?? "#ffffff";
  const backgroundImageUrl = card.content?.backgroundImageUrl;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div
            className="relative mx-auto h-[400px] w-[600px] overflow-hidden rounded-lg border border-slate-200"
            style={{
              background,
              backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
              backgroundSize: backgroundImageUrl ? "cover" : undefined,
              backgroundPosition: backgroundImageUrl ? "center" : undefined,
              backgroundRepeat: backgroundImageUrl ? "no-repeat" : undefined
            }}
          >
            {elements.map((element, index) => (
              <div
                key={element.id ?? `element-${index}`}
                className="absolute whitespace-pre-wrap"
                style={{
                  left: element.x ?? 0,
                  top: element.y ?? 0,
                  fontFamily: element.fontFamily ?? "Arial",
                  fontSize: `${element.fontSize ?? 24}px`,
                  color: element.color ?? "#111827",
                  lineHeight: 1.15
                }}
              >
                {element.content ?? ""}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

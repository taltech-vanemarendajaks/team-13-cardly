"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/landing/AppHeader";
import { apiFetch } from "@/lib/api";

type EditorMode = "create" | "edit";

type Template = {
  id: string;
  name: string;
  description: string;
  background: string;
};

type TextElement = {
  id: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
};

type CardDraft = {
  id?: string;
  title: string;
  templateId: string;
  background: string;
  backgroundImageUrl?: string;
  elements: TextElement[];
};

type CardEditorProps = {
  mode: EditorMode;
  cardId?: string;
  initialDraft?: CardDraft;
};

type CardApiResponse = {
  id: string;
  title: string;
  template: string | null;
  content?: {
    background?: string;
    backgroundImageUrl?: string;
    elements?: unknown[];
  };
};

const PREVIEW_WIDTH = 600;
const PREVIEW_HEIGHT = 400;
const FONT_OPTIONS = ["Georgia", "Arial", "Tahoma", "Verdana", "Times New Roman"];

const templates: Template[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from a plain white card.",
    background: "#ffffff"
  },
  {
    id: "birthday",
    name: "Birthday",
    description: "Warm celebratory gradient.",
    background: "linear-gradient(135deg, #fef3c7, #fecaca)"
  },
  {
    id: "thank-you",
    name: "Thank You",
    description: "Elegant cool-tone style.",
    background: "linear-gradient(135deg, #e0f2fe, #dbeafe)"
  },
  {
    id: "party",
    name: "Party",
    description: "Bold and playful color blend.",
    background: "linear-gradient(135deg, #fde68a, #fbcfe8, #c4b5fd)"
  }
];

function getDefaultElements() {
  return [
    {
      id: crypto.randomUUID(),
      content: "Happy Day!",
      fontFamily: "Georgia",
      fontSize: 42,
      color: "#111827",
      x: 170,
      y: 145
    }
  ];
}

function normalizeElements(elements: unknown): TextElement[] {
  if (!Array.isArray(elements) || elements.length === 0) {
    return getDefaultElements();
  }

  const parsed = elements
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Partial<TextElement>;

      return {
        id: typeof source.id === "string" && source.id.length > 0 ? source.id : crypto.randomUUID(),
        content: typeof source.content === "string" ? source.content : "",
        fontFamily: typeof source.fontFamily === "string" ? source.fontFamily : "Arial",
        fontSize: typeof source.fontSize === "number" ? source.fontSize : 24,
        color: typeof source.color === "string" ? source.color : "#111827",
        x: typeof source.x === "number" ? source.x : 40,
        y: typeof source.y === "number" ? source.y : 40
      };
    })
    .filter((value): value is TextElement => value !== null);

  return parsed.length > 0 ? parsed : getDefaultElements();
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read selected file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read selected file."));
    reader.readAsDataURL(file);
  });
}

async function saveCardRequest(draft: CardDraft, cardId?: string) {
  const endpoint = cardId ? `/cards/${cardId}` : "/cards";
  const method = cardId ? "PATCH" : "POST";
  const body = {
    title: draft.title,
    template: draft.templateId,
    content: {
      background: draft.background,
      backgroundImageUrl: draft.backgroundImageUrl ?? null,
      elements: draft.elements
    }
  };

  const data = await apiFetch<{ id?: string }>(endpoint, {
    method,
    body
  });

  return {
    id: data?.id ?? cardId ?? crypto.randomUUID()
  };
}

export function CardEditor({ mode, cardId, initialDraft }: CardEditorProps) {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<"template" | "editor">(
    mode === "edit" || initialDraft ? "editor" : "template"
  );
  const [draft, setDraft] = useState<CardDraft>(
    initialDraft ?? {
      title: "Untitled card",
      templateId: "blank",
      background: "#ffffff",
      backgroundImageUrl: undefined,
      elements: getDefaultElements()
    }
  );
  const [selectedElementId, setSelectedElementId] = useState(draft.elements[0]?.id ?? "");
  const [dragState, setDragState] = useState<{
    elementId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string>("");
  const [loadingCard, setLoadingCard] = useState(mode === "edit");
  const [loadingError, setLoadingError] = useState<string>("");

  const selectedElement = useMemo(
    () => draft.elements.find((element) => element.id === selectedElementId),
    [draft.elements, selectedElementId]
  );

  useEffect(() => {
    if (mode !== "edit" || !cardId) {
      setLoadingCard(false);
      return;
    }

    let cancelled = false;

    setLoadingCard(true);
    setLoadingError("");

    apiFetch<CardApiResponse>(`/cards/${cardId}`)
      .then((card) => {
        if (cancelled) return;

        const nextDraft: CardDraft = {
          id: card.id,
          title: card.title,
          templateId: card.template ?? "blank",
          background: card.content?.background ?? "#ffffff",
          backgroundImageUrl: card.content?.backgroundImageUrl,
          elements: normalizeElements(card.content?.elements)
        };

        setDraft(nextDraft);
        setSelectedElementId(nextDraft.elements[0]?.id ?? "");
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadingError((error as Error).message || "Failed to load card.");
      })
      .finally(() => {
        if (!cancelled) setLoadingCard(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, cardId]);

  useEffect(() => {
    if (step !== "editor") return;
    const timer = window.setTimeout(() => {
      const key = cardId ? `card-editor-${cardId}` : "card-editor-new";
      localStorage.setItem(key, JSON.stringify(draft));
      setLastAutoSavedAt(new Date().toLocaleTimeString());
    }, 450);

    return () => window.clearTimeout(timer);
  }, [draft, step, cardId]);

  useEffect(() => {
    if (!dragState) return;

    const onMouseMove = (event: MouseEvent) => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const rawX = event.clientX - rect.left - dragState.offsetX;
      const rawY = event.clientY - rect.top - dragState.offsetY;
      const clampedX = Math.max(0, Math.min(PREVIEW_WIDTH - 8, rawX));
      const clampedY = Math.max(0, Math.min(PREVIEW_HEIGHT - 8, rawY));
      setDraft((currentDraft) => ({
        ...currentDraft,
        elements: currentDraft.elements.map((element) =>
          element.id === dragState.elementId ? { ...element, x: clampedX, y: clampedY } : element
        )
      }));
    };

    const onMouseUp = () => setDragState(null);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragState]);

  const updateElement = (id: string, updates: Partial<TextElement>) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      elements: currentDraft.elements.map((element) =>
        element.id === id ? { ...element, ...updates } : element
      )
    }));
  };

  const addTextElement = () => {
    const newElement: TextElement = {
      id: crypto.randomUUID(),
      content: "New text",
      fontFamily: "Arial",
      fontSize: 26,
      color: "#1f2937",
      x: 40,
      y: 40
    };
    setDraft((currentDraft) => ({
      ...currentDraft,
      elements: [...currentDraft.elements, newElement]
    }));
    setSelectedElementId(newElement.id);
  };

  const removeElement = (elementId: string) => {
    setDraft((currentDraft) => {
      const nextElements = currentDraft.elements.filter((element) => element.id !== elementId);
      if (nextElements.length > 0 && selectedElementId === elementId) {
        setSelectedElementId(nextElements[0].id);
      }
      return { ...currentDraft, elements: nextElements };
    });
  };

  const onTemplatePick = (template: Template) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      templateId: template.id,
      background: template.background,
      backgroundImageUrl: undefined
    }));
    setStep("editor");
  };

  const onBackgroundImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      setDraft((currentDraft) => ({
        ...currentDraft,
        backgroundImageUrl: imageDataUrl
      }));
      setStatusMessage("Custom picture applied.");
    } catch (error) {
      setStatusMessage((error as Error).message || "Failed to load selected image.");
    } finally {
      input.value = "";
    }
  };

  const onElementMouseDown = (event: ReactMouseEvent, element: TextElement) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - element.x;
    const offsetY = event.clientY - rect.top - element.y;
    setSelectedElementId(element.id);
    setDragState({ elementId: element.id, offsetX, offsetY });
  };

  const onSave = async () => {
    setSaving(true);
    setStatusMessage("");
    try {
      await saveCardRequest(draft, cardId);
      setStatusMessage(
        `Card saved successfully (${mode === "edit" ? "updated" : "created"}). Redirecting to dashboard...`
      );
      window.setTimeout(() => {
        router.push("/cards?saved=1");
      }, 850);
    } catch (error) {
      setStatusMessage((error as Error).message || "Failed to save card.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingCard) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center p-8 pt-24">
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading card...</p>
        </main>
      </>
    );
  }

  if (loadingError) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-4 p-8 pt-24">
          <p className="text-sm text-destructive">{loadingError}</p>
          <button
            type="button"
            onClick={() => router.push("/cards")}
            className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
          >
            Back to cards
          </button>
        </main>
      </>
    );
  }

  if (step === "template") {
    return (
      <>
      <AppHeader />
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-8 pt-24">
        <button
          type="button"
          onClick={() => router.push("/cards")}
          className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cards
        </button>
        <h1 className="text-3xl font-semibold">Select a template</h1>
        <p className="text-muted-foreground">Choose a default or start from blank.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="rounded-lg border p-4 text-left transition hover:shadow-md"
              onClick={() => onTemplatePick(template)}
            >
              <div
                className="mb-3 flex h-32 w-full items-center justify-center rounded-md border"
                style={{ background: template.background }}
              >
              </div>
              <h2 className="text-lg font-medium">{template.name}</h2>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </button>
          ))}
        </div>
      </main>
      </>
    );
  }

  return (
    <>
    <AppHeader />
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 p-6 pt-24 lg:p-8 lg:pt-24">
      <button
        type="button"
        onClick={() => router.push("/cards")}
        className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cards
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold">
          {mode === "edit" ? "Edit Card" : "Create Card"}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
            disabled={saving}
            onClick={onSave}
          >
            {saving ? "Saving..." : "Save card"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border bg-card p-4">
          <h2 className="text-lg font-medium">Editor controls</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Card title</label>
              <Input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Card title"
              />
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <label className="block text-sm font-medium">Custom picture</label>
              <Input type="file" accept="image/*" onChange={onBackgroundImageChange} />
              {draft.backgroundImageUrl ? (
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      backgroundImageUrl: undefined
                    }))
                  }
                >
                  Remove custom picture
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Upload a photo to use it as card background.
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium">Text elements</label>
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
                  onClick={addTextElement}
                >
                  Add text
                </button>
              </div>

              <div className="space-y-2">
                {draft.elements.map((element, index) => (
                  <div
                    key={element.id}
                    className={`flex items-center justify-between rounded-md border p-2 ${
                      selectedElementId === element.id ? "border-primary" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="truncate text-sm"
                      onClick={() => setSelectedElementId(element.id)}
                    >
                      {index + 1}. {element.content || "Untitled text"}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border px-2 py-1 text-xs text-destructive hover:bg-accent"
                      onClick={() => removeElement(element.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedElement ? (
              <div className="space-y-3 rounded-md border p-3">
                <h3 className="text-sm font-medium">Selected text settings</h3>
                <div>
                  <label className="mb-1 block text-xs font-medium">Content</label>
                  <Input
                    value={selectedElement.content}
                    onChange={(event) =>
                      updateElement(selectedElement.id, { content: event.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">Font</label>
                    <select
                      className="h-9 w-full rounded-md border px-2 text-sm"
                      value={selectedElement.fontFamily}
                      onChange={(event) =>
                        updateElement(selectedElement.id, { fontFamily: event.target.value })
                      }
                    >
                      {FONT_OPTIONS.map((fontName) => (
                        <option key={fontName} value={fontName}>
                          {fontName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Size</label>
                    <Input
                      type="number"
                      min={12}
                      max={96}
                      value={selectedElement.fontSize}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          fontSize: Number(event.target.value) || 12
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">Color</label>
                    <Input
                      type="color"
                      value={selectedElement.color}
                      onChange={(event) =>
                        updateElement(selectedElement.id, { color: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Position (x, y)</label>
                    <Input
                      value={`${Math.round(selectedElement.x)}, ${Math.round(selectedElement.y)}`}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-md border p-3 text-sm text-muted-foreground">
                Add a text element to start editing.
              </p>
            )}

            {lastAutoSavedAt ? (
              <p className="text-xs text-muted-foreground">Auto-saved locally at {lastAutoSavedAt}.</p>
            ) : null}
            {statusMessage ? <p className="text-sm">{statusMessage}</p> : null}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h2 className="text-lg font-medium">Live preview</h2>
          <p className="text-sm text-muted-foreground">Drag text directly on the card to reposition.</p>

          <div className="mt-4 overflow-auto rounded-md border bg-muted p-4">
            <div
              ref={previewRef}
              className="relative mx-auto select-none overflow-hidden rounded-lg border shadow-sm"
              style={{
                width: PREVIEW_WIDTH,
                height: PREVIEW_HEIGHT,
                background: draft.background,
                backgroundImage: draft.backgroundImageUrl ? `url(${draft.backgroundImageUrl})` : undefined,
                backgroundSize: draft.backgroundImageUrl ? "cover" : undefined,
                backgroundPosition: draft.backgroundImageUrl ? "center" : undefined,
                backgroundRepeat: draft.backgroundImageUrl ? "no-repeat" : undefined
              }}
            >
              {draft.elements.map((element) => (
                <div
                  key={element.id}
                  role="button"
                  tabIndex={0}
                  className={`absolute cursor-move rounded px-1 ${
                    selectedElementId === element.id ? "outline outline-2 outline-primary" : ""
                  }`}
                  onMouseDown={(event) => onElementMouseDown(event, element)}
                  onClick={() => setSelectedElementId(element.id)}
                  style={{
                    left: element.x,
                    top: element.y,
                    color: element.color,
                    fontFamily: element.fontFamily,
                    fontSize: `${element.fontSize}px`,
                    lineHeight: 1.15
                  }}
                >
                  {element.content}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}

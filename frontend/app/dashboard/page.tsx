import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <Link
          href="/editor/new"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Create new card
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        Demo placeholder dashboard. Save from editor redirects here.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border p-4">
          <h2 className="text-lg font-medium">Thank You Demo Card</h2>
          <p className="mt-1 text-sm text-muted-foreground">Last updated: just now</p>
          <div className="mt-4 flex gap-2">
            <Link href="/editor/demo-card-1" className="rounded-md border px-3 py-2 text-sm hover:bg-accent">
              Edit
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

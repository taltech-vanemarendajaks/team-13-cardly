import Link from "next/link";

const links = [
  { href: "/login", label: "Login" },
  { href: "/editor/new", label: "New Card" }
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Cardly</h1>
      <p className="text-muted-foreground">Coming soon</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </main>
  );
}

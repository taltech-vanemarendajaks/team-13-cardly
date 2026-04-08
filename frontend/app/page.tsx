import Link from "next/link";
import { AuthControls } from "../tempTestAuth/AuthControls";

const links = [
  { href: "/login", label: "Login" },
  { href: "/editor/new", label: "New Card" }
];

type HomePageProps = {
  searchParams?: Promise<{
    auth?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const authParam = Array.isArray(resolvedSearchParams.auth)
    ? resolvedSearchParams.auth[0]
    : resolvedSearchParams.auth;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Cardly</h1>
      <p className="text-muted-foreground">Coming soon</p>
      <AuthControls authSuccess={authParam === "success"} />
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

import { AuthControls } from "../../tempTestAuth/AuthControls";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-semibold">Login</h1>
      <p className="text-muted-foreground">
        Minimal review page for the Google OAuth flow wired to the backend.
      </p>
      <AuthControls authSuccess={false} />
    </main>
  );
}

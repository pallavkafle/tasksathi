import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">TaskSight</h1>
        <p className="mt-1 text-sm text-muted-foreground">your AI task companion</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

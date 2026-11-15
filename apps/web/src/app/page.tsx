import { APP_NAME } from "@tasksathi/shared";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-text">{APP_NAME}</h1>
      <p className="text-lg text-muted">Your AI task companion. Scaffold is live.</p>
    </div>
  );
}

"use client";

type Status = "pending" | "active" | "done";

export function StatusStep({
  label,
  status,
  detail,
}: {
  label: string;
  status: Status;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 w-5 h-5 flex items-center justify-center flex-shrink-0">
        {status === "done" && <span className="text-green-400 text-sm">✓</span>}
        {status === "active" && (
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse block" />
        )}
        {status === "pending" && <span className="w-3 h-3 rounded-full bg-zinc-700 block" />}
      </div>
      <div>
        <p className={`text-sm ${status === "pending" ? "text-zinc-600" : "text-white"}`}>
          {label}
        </p>
        {detail && status === "done" && (
          <p className="text-xs text-zinc-400 mt-0.5">{detail}</p>
        )}
      </div>
      <div className="ml-auto">
        {status === "done" && <span className="text-xs text-zinc-600">[done]</span>}
        {status === "active" && <span className="text-xs text-red-400">[live]</span>}
        {status === "pending" && <span className="text-xs text-zinc-700">[next]</span>}
      </div>
    </div>
  );
}

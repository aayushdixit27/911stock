"use client";

export function PhoneRinging() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-3xl animate-bounce">
          📞
        </div>
        <div className="absolute inset-0 rounded-full bg-red-600 opacity-30 animate-ping" />
      </div>
      <p className="text-red-400 text-sm animate-pulse font-medium tracking-wider">
        CALLING YOUR PHONE...
      </p>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Sparkles, X } from "lucide-react";

export function WelcomeToast() {
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const prevStatus = useRef(status);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    // Show whenever the login page sets this flag, OR on a direct
    // unauthenticated -> authenticated transition within this component.
    let shouldShow = false;
    try {
      if (sessionStorage.getItem("fresh-just-logged-in") === "1") {
        sessionStorage.removeItem("fresh-just-logged-in");
        shouldShow = true;
      }
    } catch {}
    if (
      prevStatus.current === "unauthenticated" &&
      status === "authenticated"
    ) {
      shouldShow = true;
    }

    if (shouldShow) {
      setClosing(false);
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => handleClose(), 3000);
    }
    prevStatus.current = status;
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [status, session?.user?.email]);

  function handleClose() {
    setClosing(true);
    setTimeout(() => setVisible(false), 250);
  }

  if (!visible || !session?.user) return null;

  const name =
    session.user.name?.split(" ")[0] ||
    session.user.email?.split("@")[0] ||
    "back";

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-40 top-[68px] sm:top-[76px] transition-all duration-300 ${
        closing ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 bg-black text-white px-4 sm:px-5 py-2.5 rounded-full shadow-lg border border-white/10">
        <Sparkles size={16} className="text-yellow-300 shrink-0" />
        <p className="text-xs sm:text-sm font-medium whitespace-nowrap">
          Welcome back, <span className="font-bold capitalize">{name}</span>!
        </p>
        <button
          onClick={handleClose}
          aria-label="Dismiss"
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

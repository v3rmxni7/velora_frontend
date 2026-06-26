import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Ava's persona mark — a dimensional indigo "spark orb". This is Velora's honest-instrument identity
// made into a character: the brand indigo + the spark motif + a glassy top highlight read as a
// *presence*, NOT a fabricated human face (which would both fight the no-fake-humans honesty stance
// and just copy Artisan's avatar). Decorative by default (aria-hidden) — pair it with the "Ava" label.
//
// Sizing: defaults to a 24px (size-6) orb with a size-3.5 spark; pass `className` (e.g. "size-7") and
// `iconClassName` (e.g. "size-4") to scale. The `active` ring is a soft indigo halo for "thinking/open".
export function AvaAvatar({
  className,
  iconClassName,
  active = false,
}: {
  className?: string;
  iconClassName?: string;
  active?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-6 shrink-0 items-center justify-center rounded-full text-white",
        "bg-[radial-gradient(120%_120%_at_30%_22%,#818cf8_0%,#4f46e5_52%,#3730a3_100%)]",
        "shadow-[0_1px_2px_0_rgba(79,70,229,0.45),inset_0_1px_0_0_rgba(255,255,255,0.28)]",
        active && "ring-2 ring-primary/30",
        className,
      )}
    >
      <Sparkles className={cn("size-3.5", iconClassName)} strokeWidth={2.25} />
    </span>
  );
}

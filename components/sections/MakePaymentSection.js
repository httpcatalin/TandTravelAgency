import { cn } from "@/lib/utils";

export default function MakePaymentSection({ className }) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-[12px] bg-white p-4 text-center shadow-lg",
        className,
      )}
    >
      <p className="text-lg font-semibold text-black">
        Online card payments are disabled
      </p>
      <p className="text-sm text-secondary">
        We&apos;re currently finalizing our offline payment flow, so this demo no
        longer processes cards. Please contact support to complete your booking
        and we&apos;ll confirm it manually.
      </p>
    </div>
  );
}

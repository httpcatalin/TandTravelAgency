"use client";
import { TabContentMockup } from "@/components/pages/profile/ui/TabContentMockup";

export default function SavedCards() {
  return (
    <TabContentMockup title={"Payment Methods"}>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 rounded-[12px] bg-white p-6 text-center shadow-md">
        <p className="text-xl font-semibold text-black">
          Card payments are currently unavailable
        </p>
        <p className="text-sm text-secondary">
          We&apos;ve removed online card storage and processing from this demo. If
          you need to settle a booking, please contact our support team to
          arrange payment manually.
        </p>
      </div>
    </TabContentMockup>
  );
}

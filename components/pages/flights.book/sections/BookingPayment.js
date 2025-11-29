"use client";
import Countdown from "@/components/local-ui/Countdown";
import { AlertTriangle, ClockIcon } from "lucide-react";
import MakePaymentSection from "@/components/sections/MakePaymentSection";
import useFetch from "@/lib/hooks/useFetch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function BookingPayment({ flightNumber, flightDateTimestamp }) {
  const {
    data: flightBookingData,
    loading: flightBookingLoading,
    error: flightBookingError,
    retry: flightBookingRetry,
  } = useFetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/get_reserved_flight`,
    {
      method: "POST",
      contentType: "application/json",
      body: JSON.stringify({
        flightNumber,
        flightDateTimestamp,
      }),
    },
  );
  return flightBookingError ? (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-6 rounded-md border border-red-300 bg-red-50 p-6 shadow-sm">
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Failed loading payment form</h2>
      </div>
      <p className="max-w-xl text-center text-sm text-red-700">
        {flightBookingError || "Something went wrong. Please try again."}
      </p>
      {flightBookingError !== "Flight not reserved or got canceled" && (
        <Button onClick={flightBookingRetry} variant="destructive">
          Try Again
        </Button>
      )}
    </div>
  ) : (
    <>
      <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 shadow-md">
        <p className="text-sm text-gray-800">
          Your booking has been reserved and will be held for a limited time.
          Please complete the payment within the limit to confirm and finalize
          your booking. After the reservation is expired, there is no guarantee
          that your seat will be reserved and may be taken by someone else.
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-yellow-800">
          <ClockIcon className="h-4 w-4 text-yellow-600" />
          Guaranteed reservation until:{" "}
          {!flightBookingLoading ? (
            <Countdown
              currentTimeMs={Date.now()}
              timeoutAtMs={
                new Date(
                  flightBookingData?.data?.guaranteedReservationUntil,
                )?.getTime() || 0
              }
            />
          ) : (
            <Skeleton className="h-4 w-20" />
          )}
        </div>
      </div>
      <div className="mb-[20px] rounded-[12px] bg-white p-[16px] shadow-md lg:mb-[30px] xl:mb-[40px]">
        <p className="text-sm text-secondary">
          Card payments are unavailable in this environment. Please contact our
          travel desk to finalize the ticketing and arrange payment manually.
        </p>
      </div>
      <MakePaymentSection className="w-full shadow-none" />
    </>
  );
}

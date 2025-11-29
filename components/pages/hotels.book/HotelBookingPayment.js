"use client";
import Countdown from "@/components/local-ui/Countdown";
import { AlertTriangle, ClockIcon } from "lucide-react";
import MakePaymentSection from "@/components/sections/MakePaymentSection";
import useFetch from "@/lib/hooks/useFetch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { confirmHotelBookingCashAction } from "@/lib/actions/confirmHotelBookingAction";
export default function HotelBookingPayment({
  slug,
  checkInDate,
  checkOutDate,
}) {
  const router = useRouter();
  const {
    data: hotelBookingData,
    loading: hotelBookingLoading,
    error: hotelBookingError,
    retry: hotelBookingRetry,
  } = useFetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/get_reserved_hotel`,
    {
      method: "POST",
      contentType: "application/json",
      body: JSON.stringify({
        slug,
        checkInDate,
        checkOutDate,
      }),
    },
  );

  function onSuccessCash() {
    toast({
      title: "Booking confirmed",
      description: "Your booking was confirmed, redirecting...",
      variant: "default",
    });

    setTimeout(() => {
      const searchParams = new URLSearchParams({
        title: "Booking confirmed",
        message: "Your booking was confirmed. You can pay on property or now",
        callbackUrl: `/user/my_bookings/hotels/${hotelBookingData.data._id}`,
        callbackTitle: "View booking",
      });
      router.push(`/success?${searchParams.toString()}`);
    }, 2000);
  }

  return hotelBookingError ? (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-6 rounded-md border border-red-300 bg-red-50 p-6 shadow-sm">
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Failed loading payment form</h2>
      </div>
      <p className="max-w-xl text-center text-sm text-red-700">
        {hotelBookingError || "Something went wrong. Please try again."}
      </p>
      {hotelBookingError !== "No reserved hotel booking found" && (
        <Button onClick={hotelBookingRetry} variant="destructive">
          Try Again
        </Button>
      )}
    </div>
  ) : (
    <>
      <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 shadow-md">
        <p className="text-sm text-gray-800">
          Your booking has been reserved and will be held for a limited time.
          Please confirm the booking within the limit whether by selecting cash
          payment on the property or by making a payment using card.. After the
          reservation is expired, there is no guarantee that one of the rooms in
          your booking will be reserved and may be taken by someone else.
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-yellow-800">
          <ClockIcon className="h-4 w-4 text-yellow-600" />
          Guaranteed reservation until:{" "}
          {!hotelBookingLoading ? (
            <Countdown
              currentTimeMs={Date.now()}
              timeoutAtMs={
                new Date(
                  hotelBookingData?.data?.guaranteedReservationUntil,
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
          Card payments are unavailable in this environment. Please confirm the
          booking now and settle the balance directly with the property.
        </p>
      </div>
      <div className="flex flex-col gap-4 rounded-[12px] bg-white p-[16px] text-center shadow-md lg:mb-[30px] xl:mb-[40px]">
        <MakePaymentSection className={"w-full shadow-none"} />
        <Button
          onClick={async (e) => {
            e.currentTarget.disabled = true;
            const { success, message } = await confirmHotelBookingCashAction(
              hotelBookingData?.data?._id,
            );

            if (!success) {
              toast({
                title: "Error",
                description: message,
                variant: "destructive",
              });
            }
            if (success) {
              onSuccessCash();
            }
            e.currentTarget.disabled = false;
          }}
          variant="default"
          className="mx-auto w-[200px]"
        >
          Confirm & Pay Later
        </Button>
      </div>
    </>
  );
}

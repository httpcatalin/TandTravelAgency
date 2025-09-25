"use client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function PackageResultCard({ item, imageUrl }) {
  const hotel = item?.accommodation?.hotel || {};
  const room = item?.accommodation?.room || {};
  const meal = item?.accommodation?.meal || {};
  const placement = item?.accommodation?.placement || {};
  const price = item?.price || {};
  const dates = item?.dates || {};
  const nights = item?.nights || {};
  const tickets = item?.tickets || {};
  const transfers = item?.transfers || {};
  const tourists = item?.tourists || {};

  const firstImage =
    imageUrl ||
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1170&auto=format&fit=crop";

  return (
    <div className="flex h-min rounded-[8px] bg-white text-[0.75rem] font-medium text-secondary shadow-sm max-md:flex-col">
      <div className="h-auto w-full max-md:h-[300px] md:w-[400px]">
        <img
          className="h-full w-full rounded-l-[12px] object-cover max-md:rounded-r-[8px]"
          src={firstImage}
          alt={hotel?.name || "Hotel image"}
        />
      </div>
      <div className="flex w-full flex-col p-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex min-w-[260px] grow flex-col gap-1">
            <p className="text-2xl font-bold">{hotel?.name || "Hotel"}</p>
            <p>
              {hotel?.category ? `${hotel.category}` : null}
              {hotel?.city
                ? `${hotel.category ? " • " : ""}${hotel.city}`
                : null}
            </p>
            <p className="text-xs text-secondary/70">
              ID: {hotel?.id ?? "N/A"}
            </p>
          </div>
          <div className="flex grow flex-col items-end gap-1 text-right">
            <p className="text-2xl font-bold text-tertiary">
              {price?.amount != null
                ? `${price.amount} ${price?.currency || ""}`
                : "—"}
            </p>
            <p className="text-xs text-secondary/70">
              Type: {price?.type || "N/A"}
            </p>
          </div>
        </div>
        <Separator className="my-3" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Accommodation</h4>
            <div>Room: {room?.name || room?.id || "N/A"}</div>
            <div>Meal: {meal?.full_name || meal?.name || "N/A"}</div>
            <div>Placement: {placement?.name || placement?.id || "N/A"}</div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Dates & Nights</h4>
            <div>Check-in: {dates?.check_in || "N/A"}</div>
            <div>Check-out: {dates?.check_out || "N/A"}</div>
            <div>Nights: {nights?.total ?? "N/A"}</div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Tickets (From)</h4>
            <div>Airline: {tickets?.from?.airline?.airline || "N/A"}</div>
            <div>
              Depart: {tickets?.from?.departure?.date}{" "}
              {tickets?.from?.departure?.time}
            </div>
            <div>
              Arrive: {tickets?.from?.arrival?.date}{" "}
              {tickets?.from?.arrival?.time}
            </div>
            <div>
              {tickets?.from?.airports?.from?.prefix || ""} →{" "}
              {tickets?.from?.airports?.to?.prefix || ""}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Tickets (To)</h4>
            <div>Airline: {tickets?.to?.airline?.airline || "N/A"}</div>
            <div>
              Depart: {tickets?.to?.departure?.date}{" "}
              {tickets?.to?.departure?.time}
            </div>
            <div>
              Arrive: {tickets?.to?.arrival?.date} {tickets?.to?.arrival?.time}
            </div>
            <div>
              {tickets?.to?.airports?.from?.prefix || ""} →{" "}
              {tickets?.to?.airports?.to?.prefix || ""}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Transfers</h4>
            <div>To: {transfers?.to ?? "N/A"}</div>
            <div>From: {transfers?.from ?? "N/A"}</div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Tourists</h4>
            <div>Adults: {tourists?.adults ?? "N/A"}</div>
            <div>
              Children ages:{" "}
              {Array.isArray(tourists?.children_ages)
                ? tourists.children_ages.join(", ") || "None"
                : "N/A"}
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="rounded-md bg-muted/30 p-3">
          <div className="mb-2 text-sm font-semibold">All fields</div>
          <pre className="mt-2 max-h-[400px] overflow-auto rounded bg-white p-3 text-[11px] leading-tight">
            {JSON.stringify(item, null, 2)}
          </pre>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <Button size="sm" variant="secondary" asChild>
            <a href="#" target="_blank" rel="noreferrer">
              Details
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { HotelResultCard } from "@/components/pages/hotels.search/ui/HotelResultCard";
import PackageResultCard from "@/components/pages/hotels.search/ui/PackageResultCard";
import { getManyDocs } from "@/lib/db/getOperationDB";
import { auth } from "@/lib/auth";
import { RATING_SCALE } from "@/lib/constants";
import { getUserDetails } from "@/lib/services/user";
import validateHotelSearchParams from "@/lib/zodSchemas/hotelSearchParams";
import SetHotelFormState from "@/components/helpers/SetHotelFormState";
import { getHotels } from "@/lib/services/hotels";
import Jumper from "@/components/local-ui/Jumper";
import extractFiltersObjFromSearchParams from "@/lib/helpers/hotels/extractFiltersObjFromSearchParams";
import validateHotelSearchFilter from "@/lib/zodSchemas/hotelSearchFilterValidation";
import { singleRoomFareBreakdown } from "@/lib/helpers/hotels/priceCalculation";
import { EmptyResult } from "@/components/EmptyResult";
import { cookies } from "next/headers";
import SetCookies from "@/components/helpers/SetCookies";
export default async function HotelResultPage({ params }) {
  const decodedSp = decodeURIComponent(params.hotelSearchParams);
  const spObj = Object.fromEntries(new URLSearchParams(decodedSp));
  const isPackageMode = spObj?.package_mode === "1";

  let filters = extractFiltersObjFromSearchParams(spObj);
  const validatedFilters = validateHotelSearchFilter(filters);

  const session = await auth();

  const validate = isPackageMode
    ? { success: true, data: {} }
    : validateHotelSearchParams(spObj);

  const formStateError = {
    ...spObj,
    checkIn: new Date(spObj.checkIn)?.toLocaleString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    checkOut: new Date(spObj.checkOut)?.toLocaleString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    destination: { city: spObj.city, country: spObj.country },
    errors: validate.errors,
  };
  delete formStateError.city;
  delete formStateError.country;

  if (!isPackageMode && validate.success === false) {
    return <SetHotelFormState obj={formStateError} />;
  }

  // Package mode: call package search endpoint and render using the same card
  if (isPackageMode) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const payload = {
      package_template: spObj.package_template,
      adults: Number(spObj.guests) || 1,
      date_from: spObj.checkIn,
      date_to: spObj.checkOut,
      filters: validatedFilters?.data || {},
    };
    let packages = [];
    try {
      const res = await fetch(`${baseUrl}/api/hotels/packages/search`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          cookie: cookies().toString(), 
         },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const json = await res.json();
      packages = json?.data?.results || [];
    } catch (e) {
      packages = [];
    }

    const hotelsFromPackages = await Promise.all(
      packages.map(async (item, idx) => {
        const hotel = item?.accommodation?.hotel || {};
        const name = hotel?.name || "Hotel";
        const addressObj = hotel?.address || {};
        const address = Object.values(addressObj)
          .filter((v) => typeof v === "string" && v.trim().length)
          .join(", ");
        const amenities = Array.isArray(hotel?.amenities)
          ? hotel.amenities.slice(0, 5)
          : Array.isArray(hotel?.features)
            ? hotel.features.slice(0, 5)
            : [];
        const image =
          item?.accommodation?.images?.[0]?.url ||
          hotel?.images?.[0]?.url ||
          hotel?.image ||
          undefined;
        const rating = Number(hotel?.rating) || 0;
        const totalReviews = Number(hotel?.reviews_count) || 0;
        const ratingScale = RATING_SCALE[Math.floor(rating)] || "N/A";
        const amount = (() => {
          const p = item?.price || {};
          const v = p.amount ?? p.total ?? p.price ?? p.value ?? 0;
          const n = Number(v);
          return Number.isFinite(n) ? n : 0;
        })();
        const price = {
          base: amount,
          tax: 0,
          serviceFee: 0,
          discount: { type: "fixed", amount: 0 },
        };
        // Try to fetch first photo via Google Places (server-proxied)
        let giataImage; // repurpose variable for imageUrl
        try {
          const query = [name, address].filter(Boolean).join(", ");
          const gpRes = await fetch(
            `${baseUrl}/api/google/places/photo?q=${encodeURIComponent(query)}`,
            { cache: "no-store" }
          );
          if (gpRes.ok) {
            const gp = await gpRes.json();
            giataImage = gp?.data?.photo?.proxyPath || giataImage;
          }
        } catch {}

        return {
          _id: String(hotel?.id ?? hotel?.code ?? `${name}-${idx}`),
          slug: "#",
          name,
          address,
          amenities,
          image: giataImage || image,
          price,
          availableRoomsCount: 1,
          rating,
          totalReviews,
          ratingScale,
          liked: false,
          __raw: item,
          __giataImage: giataImage,
        };
      })
    );

    const hotelResultsForCard = hotelsFromPackages.filter(Boolean);

    return (
      <div className="w-full">
        <div className="mb-10">
          <Jumper id={"hotelResults"} />
        </div>
        {!hotelResultsForCard?.length ? (
          <EmptyResult
            className={"h-full w-full"}
            message="No Packages Found"
          />
        ) : (
          <div className="space-y-4">
            {hotelResultsForCard.map((hotel) => (
              <PackageResultCard
                key={hotel._id}
                item={hotel.__raw}
                imageUrl={hotel.__giataImage || hotel.image}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  let hotels = await getHotels(validate.data, {
    filters: validatedFilters?.data,
  });

  // show liked hotels if user is logged in
  if (session?.user?.id) {
    const userDetails = await getUserDetails(session?.user?.id);

    hotels = hotels.map((hotel) => {
      const liked = userDetails?.hotels?.bookmarked?.includes(hotel._id);
      return { ...hotel, liked };
    });
  }

  // rating and reviews
  const hotelResultsForCard = (
    await Promise.all(
      hotels.map(async (hotel) => {
        const reviews = await getManyDocs(
          "HotelReview",
          { hotelId: hotel._id, slug: hotel.slug },
          [hotel._id + "_review", hotel.slug + "_review", "hotelReviews"]
        );
        const totalRatingsSum = reviews.reduce(
          (acc, review) => acc + +review.rating,
          0
        );
        const totalReviewsCount = reviews.length;
        const rating = totalRatingsSum / totalReviewsCount;
        const ratingScale = RATING_SCALE[Math.floor(rating)];

        const filterRates = validatedFilters?.data?.rates || [];
        if (filterRates.length) {
          const ratingFilter = filterRates.includes(`${Math.floor(rating)}`);
          if (!ratingFilter) return null;
        }

        const cheapestRoom = [...hotel.rooms].sort((a, b) => {
          const aPrice = singleRoomFareBreakdown(a, 1).total;
          const bPrice = singleRoomFareBreakdown(b, 1).total;

          return aPrice - bPrice;
        })[0];

        return {
          _id: hotel._id,
          slug: hotel.slug,
          name: hotel.name,
          address: Object.values(hotel.address).join(", "),
          amenities: hotel.amenities.slice(0, 5),
          price: cheapestRoom.price,
          availableRoomsCount: hotel.rooms.length,
          rating: rating,
          totalReviews: totalReviewsCount,
          ratingScale: ratingScale || "N/A",
          image: hotel.images[0],
          liked: hotel.liked,
        };
      })
    )
  ).filter(Boolean);

  const sParams = JSON.stringify(validate.data);
  const searchStateCookie = cookies().get("hotelSearchState")?.value;
  let isNewSearch = searchStateCookie !== sParams;

  return (
    <div className="w-full">
      {isNewSearch && (
        <SetCookies
          cookies={[
            {
              name: "hotelSearchState",
              value: sParams,
              expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            },
          ]}
        />
      )}
      <div className="mb-10">
        <Jumper id={"hotelResults"} />
      </div>
      {!hotelResultsForCard?.length ? (
        <EmptyResult className={"h-full w-full"} message="No Hotels Found" />
      ) : (
        <div className="space-y-4">
          {hotelResultsForCard.map((hotel) => (
            <HotelResultCard
              key={hotel._id}
              hotel={hotel}
              searchState={validate.data}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export async function POST(req) {
  try {
    const bearerToken = process.env.EXTERNAL_API_BEARER_TOKEN;
    const apiBaseUrl = process.env.EXTERNAL_API_BASE_URL;
    const airportCityFromEnv = process.env.EXTERNAL_API_AIRPORT_CITY_FROM;
    if (!bearerToken || !apiBaseUrl) {
      return Response.json(
        { success: false, message: "Missing required environment variables" },
        { status: 500 }
      );
    }

    const input = await req.json();
    const pageNumber = Number.isFinite(Number(input?.page))
      ? Number(input?.page)
      : 1;
    const limitNumber = Number.isFinite(Number(input?.limit))
      ? Number(input?.limit)
      : 20;
    const page = Math.max(1, Math.trunc(pageNumber));
    const pageSize = Math.min(50, Math.max(1, Math.trunc(limitNumber)));
    const filters =
      input?.filters && typeof input.filters === "object" ? input.filters : {};

    const body = { ...input };
    delete body.page;
    delete body.limit;
    delete body.filters;
    if (!body.airport_city_from && airportCityFromEnv) {
      const n = Number(airportCityFromEnv);
      body.airport_city_from = Number.isNaN(n) ? airportCityFromEnv : n;
    }
    if (!body.adults) {
      body.adults = 1;
    }
    const parseInputDate = (val) => {
      if (!val) return undefined;
      if (/^\d+$/.test(val)) return new Date(Number(val));
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return new Date(val + "T00:00:00");
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(val)) {
        const [dd, mm, yyyy] = val.split(".");
        return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
      }
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    };
    const fmt = (d) => {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    };

    let df = parseInputDate(body.date_from);
    let dt = parseInputDate(body.date_to);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!df || df < today) df = today;
    if (!dt || dt <= df) {
      dt = new Date(df.getTime() + 3 * 24 * 60 * 60 * 1000);
    }
    let diffDays = Math.round(
      (dt.getTime() - df.getTime()) / (1000 * 60 * 60 * 24)
    );
    const minNights = 3;
    if (diffDays < minNights) {
      diffDays = minNights;
      dt = new Date(df.getTime() + diffDays * 24 * 60 * 60 * 1000);
    }
    if (!body.nights_from || body.nights_from < minNights)
      body.nights_from = diffDays;
    if (!body.nights_to) body.nights_to = body.nights_from;

    body.date_from = fmt(df);
    body.date_to = fmt(dt);

    const packageTemplateId = body.package_template ?? input?.package_template;
    const toNumber = (v) => {
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    };

    if (packageTemplateId) {
      try {
        const acf = body.airport_city_from;
        const qs = acf ? `?airport_city_from=${encodeURIComponent(acf)}` : "";

        const locRes = await fetch(
          `${apiBaseUrl}/search/package_templates/${packageTemplateId}/locations${qs}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${bearerToken}` },
            cache: "no-store",
          }
        );
        if (locRes.ok) {
          const locData = await locRes.json();
          const regions = Array.isArray(locData)
            ? locData
            : Array.isArray(locData?.data)
              ? locData.data
              : [];
          const cityIds = regions.flatMap((r) =>
            Array.isArray(r?.cities)
              ? r.cities.map((c) => toNumber(c?.id)).filter(Boolean)
              : []
          );
          if (cityIds.length) {
            const existing = Array.isArray(body.airport_city_to)
              ? body.airport_city_to
              : body.airport_city_to
                ? [body.airport_city_to]
                : [];
            const merged = Array.from(
              new Set([
                ...existing.map((x) => toNumber(x)).filter(Boolean),
                ...cityIds,
              ])
            );
            if (merged.length) body.airport_city_to = merged;
          }
        }

        const hotelsRes = await fetch(
          `${apiBaseUrl}/search/package_templates/${packageTemplateId}/hotels${qs}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${bearerToken}` },
            cache: "no-store",
          }
        );
        if (hotelsRes.ok) {
          const hotelsData = await hotelsRes.json();
          const hotelsArr = Array.isArray(hotelsData)
            ? hotelsData
            : Array.isArray(hotelsData?.data)
              ? hotelsData.data
              : [];
          const hotelIds = hotelsArr
            .map((h) => toNumber(h?.id))
            .filter(Boolean);
          if (hotelIds.length) {
            const existingHotels = Array.isArray(body.selected_hotels)
              ? body.selected_hotels
              : body.selected_hotels
                ? [body.selected_hotels]
                : [];
            const mergedHotels = Array.from(
              new Set([
                ...existingHotels.map((x) => toNumber(x)).filter(Boolean),
                ...hotelIds,
              ])
            );
            if (mergedHotels.length) body.selected_hotels = mergedHotels;
          }
        }
      } catch (e) {
        console.warn("Package prefetch failed", e?.message || e);
      }
    }
    const url = `${apiBaseUrl}/search`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    console.log("package search body", body);
    if (!response.ok) {
      const text = await response.text();
      console.log(text);
      return Response.json(
        {
          success: false,
          message: `Upstream error: ${response.status}`,
          details: text,
        },
        { status: response.status }
      );
    }
    const data = await response.json();

    const list = (() => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.results)) return data.results;
      const values = Object.values(data).filter(
        (item) => typeof item === "object" && item !== null
      );
      return Array.isArray(values) ? values : [];
    })();

    const getHotelKey = (item) => {
      const hotel = item?.accommodation?.hotel;
      return (
        hotel?.id ??
        hotel?.code ??
        (typeof hotel?.name === "string" ? hotel.name.toLowerCase() : null)
      );
    };

    const getPriceAmount = (item) => {
      const price = item?.price;
      const amount =
        price?.amount ?? price?.total ?? price?.price ?? price?.value ?? 0;
      const n = Number(amount);
      return Number.isFinite(n) ? n : 0;
    };

    const deduped = [];
    const indexByKey = new Map();

    for (const item of list) {
      const key = getHotelKey(item);
      if (!key) {
        deduped.push(item);
        continue;
      }

      if (!indexByKey.has(key)) {
        indexByKey.set(key, deduped.length);
        deduped.push(item);
        continue;
      }

      const existingIndex = indexByKey.get(key);
      const existing = deduped[existingIndex];
      if (getPriceAmount(item) < getPriceAmount(existing)) {
        deduped[existingIndex] = item;
      }
    }

    const normalizeArray = (value) =>
      Array.isArray(value)
        ? value
            .map((v) =>
              typeof v === "string" || typeof v === "number"
                ? String(v).trim()
                : null
            )
            .filter(Boolean)
        : [];

    const filterOptions = {
      priceRange: normalizeArray(filters?.priceRange)
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v)),
      rates: normalizeArray(filters?.rates),
      features: normalizeArray(filters?.features),
      amenities: normalizeArray(filters?.amenities),
    };

    const filtered = deduped.filter((item) => {
      const priceAmount = getPriceAmount(item);
      const hotel = item?.accommodation?.hotel ?? {};

      if (filterOptions.priceRange.length === 2) {
        const [min, max] = filterOptions.priceRange;
        if (
          (Number.isFinite(min) && priceAmount < min) ||
          (Number.isFinite(max) && priceAmount > max)
        ) {
          return false;
        }
      }

      if (filterOptions.rates.length) {
        const rating = Number(hotel?.rating);
        const ratingBucket = Number.isFinite(rating)
          ? String(Math.floor(rating))
          : null;
        if (!ratingBucket || !filterOptions.rates.includes(ratingBucket)) {
          return false;
        }
      }

      if (filterOptions.features.length) {
        const hotelFeatures = Array.isArray(hotel?.features)
          ? hotel.features
              .map((f) =>
                typeof f === "string" ? f.toLowerCase().trim() : null
              )
              .filter(Boolean)
          : [];
        const required = filterOptions.features.map((f) => f.toLowerCase());
        const hasAll = required.every((req) => hotelFeatures.includes(req));
        if (!hasAll) return false;
      }

      if (filterOptions.amenities.length) {
        const hotelAmenities = Array.isArray(hotel?.amenities)
          ? hotel.amenities
              .map((a) =>
                typeof a === "string" ? a.toLowerCase().trim() : null
              )
              .filter(Boolean)
          : [];
        const requiredAmenities = filterOptions.amenities.map((a) =>
          a.toLowerCase()
        );
        const hasAmenities = requiredAmenities.every((req) =>
          hotelAmenities.includes(req)
        );
        if (!hasAmenities) return false;
      }

      return true;
    });

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const results = start < total ? filtered.slice(start, end) : [];

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    const hasMore = end < total;
    
    return Response.json({
      success: true,
      data: {
        results,
        page,
        pageSize,
        total,
        totalPages,
        hasMore,
        filters: filterOptions,
      },
    });
  } catch (error) {
    console.error("Error searching packages:", error);
    return Response.json(
      {
        success: false,
        message: "Error searching packages",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

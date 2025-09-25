export async function GET(req, { params }) {
  try {
    const bearerToken = process.env.EXTERNAL_API_BEARER_TOKEN;
    const apiBaseUrl = process.env.EXTERNAL_API_BASE_URL;
    const hotelId = params?.hotel_id;

    if (!hotelId) {
      return Response.json(
        { success: false, message: "Missing hotel_id" },
        { status: 400 }
      );
    }

    if (!bearerToken || !apiBaseUrl) {
      return Response.json(
        { success: false, message: "Missing required environment variables" },
        { status: 500 }
      );
    }

    // Build a root base from EXTERNAL_API_BASE_URL by removing trailing "/api/v2" for GIATA endpoints and images
    const rootBase = apiBaseUrl.replace(/\/api\/v2\/?$/, "").replace(/\/$/, "");
    // Try '/api/giata' first, then fallback to '/giata'
    const paths = [
      `${rootBase}/api/giata/hotel/${encodeURIComponent(hotelId)}`,
      `${rootBase}/api/giata/hotel/${encodeURIComponent(hotelId)}`,
    ];

    let lastError;
    for (const url of paths) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${bearerToken}` },
          cache: "no-store",
        });
        if (hotelId == 44) console.log(res);
        if (res.ok) {
          const data = await res.json();
          // Compute first image URL from media hrefs and prefix with API base
          try {
            const firstHref =
              data?.media?.large?.[0]?.href ||
              data?.media?.small?.[0]?.href ||
              data?.content?.media?.large?.[0]?.href ||
              data?.content?.media?.small?.[0]?.href ||
              data?.data?.media?.large?.[0]?.href ||
              data?.data?.media?.small?.[0]?.href;

            const base = rootBase;
            const firstImageUrl =
              firstHref && base ? `${base}${firstHref}` : undefined;
            const firstImageProxyPath = firstHref
              ? `/api/giata/image?href=${encodeURIComponent(firstHref)}`
              : undefined;
            if (hotelId == 44) console.log(firstImageUrl);
            return Response.json({ ...data, firstImageUrl, firstImageProxyPath });
          } catch {
            return Response.json(data);
          }
        }
        lastError = new Error(`Upstream status ${res.status}`);
      } catch (e) {
        lastError = e;
      }
    }

    return Response.json(
      {
        success: false,
        message: "GIATA fetch failed",
        error: String(lastError || "Unknown error"),
      },
      { status: 502 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error fetching GIATA hotel",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, message: "Missing GOOGLE_MAPS_API_KEY" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || searchParams.get("input");
    if (!q) {
      return Response.json(
        { success: false, message: "Missing query parameter 'q' or 'input'" },
        { status: 400 }
      );
    }

    const findPlaceUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
    );
    findPlaceUrl.searchParams.set("input", q);
    findPlaceUrl.searchParams.set("inputtype", "textquery");
    findPlaceUrl.searchParams.set("fields", "place_id,name");
    findPlaceUrl.searchParams.set("key", apiKey);

    const findRes = await fetch(findPlaceUrl.toString(), { cache: "no-store" });
    const findJson = await findRes.json();
    const place = findJson?.candidates?.[0];
    const place_id = place?.place_id;
    if (!place_id) {
      return Response.json(
        { success: false, message: "No place found", data: findJson },
        { status: 404 }
      );
    }

    const detailsUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json"
    );
    detailsUrl.searchParams.set("place_id", place_id);
    detailsUrl.searchParams.set("fields", "photos,name");
    detailsUrl.searchParams.set("key", apiKey);

    const detRes = await fetch(detailsUrl.toString(), { cache: "no-store" });
    const detJson = await detRes.json();
    const photoRef = detJson?.result?.photos?.[0]?.photo_reference;
    if (!photoRef) {
      return Response.json(
        {
          success: true,
          data: { place_id, name: detJson?.result?.name, photo: null },
        },
        { status: 200 }
      );
    }

    const proxyPath = `/api/google/places/photo/image?photoreference=${encodeURIComponent(
      photoRef
    )}&maxwidth=1600`;
    return Response.json({
      success: true,
      data: {
        place_id,
        name: detJson?.result?.name,
        photo: {
          proxyPath,
          reference: photoRef,
        },
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error fetching Google Place Photo",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}

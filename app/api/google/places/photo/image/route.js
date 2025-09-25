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
    const photoreference = searchParams.get("photoreference");
    const maxwidth = searchParams.get("maxwidth") || "1600";
    if (!photoreference) {
      return Response.json(
        { success: false, message: "Missing 'photoreference'" },
        { status: 400 }
      );
    }

    const photoUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/photo"
    );
    photoUrl.searchParams.set("photoreference", photoreference);
    photoUrl.searchParams.set("maxwidth", maxwidth);
    photoUrl.searchParams.set("key", apiKey);

    const upstream = await fetch(photoUrl.toString(), { redirect: "manual" });
    // Google responds with a 302 redirect to the actual image URL
    if (upstream.status === 302) {
      const location = upstream.headers.get("location");
      if (!location) {
        return Response.json(
          { success: false, message: "Missing redirect location from Google" },
          { status: 502 }
        );
      }
      const imageRes = await fetch(location);
      const contentType = imageRes.headers.get("content-type") || "image/jpeg";
      const buf = await imageRes.arrayBuffer();
      return new Response(buf, {
        status: imageRes.status,
        headers: { "content-type": contentType },
      });
    }

    // Some environments may directly return the image
    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buf = await upstream.arrayBuffer();
    return new Response(buf, {
      status: upstream.status,
      headers: { "content-type": contentType },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error proxying Google Place Photo",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}

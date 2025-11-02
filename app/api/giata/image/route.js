import { getApiToken } from '@/lib/utils.server';

export async function GET(req) {
  try {
    const bearerToken = await getApiToken();
    const apiBaseUrl = process.env.EXTERNAL_API_BASE_URL;
    if (!bearerToken || !apiBaseUrl) {
      return Response.json(
        { success: false, message: "Missing required environment variables" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const href = searchParams.get("href");
    if (!href) {
      return Response.json(
        { success: false, message: "Missing href query parameter" },
        { status: 400 }
      );
    }

    const rootBase = apiBaseUrl.replace(/\/api\/v2\/?$/, "").replace(/\/$/, "");
    const path = href.startsWith("/") ? href : `/${href}`;
    const targetUrl = `${rootBase}${path}`;

    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${bearerToken}` },
      cache: "no-store",
    });

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
        message: "Error proxying GIATA image",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}

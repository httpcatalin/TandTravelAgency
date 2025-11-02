import { getApiToken } from '@/lib/utils.server';
export async function GET(req, { params }) {
  try {
    const bearerToken = await getApiToken();
    const apiBaseUrl = process.env.EXTERNAL_API_BASE_URL;

    if (!bearerToken || !apiBaseUrl) {
      return Response.json(
        { success: false, message: "Missing required environment variables" },
        { status: 500 }
      );
    }

    const templateId = params.template_id;
    if (!templateId) {
      return Response.json(
        { success: false, message: "Template ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${apiBaseUrl}/api/v2/search/package_templates/${templateId}/hotel_categories`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OBS API error:", errorText);
      return Response.json(
        {
          success: false,
          message: "Failed to fetch hotel categories",
          error: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    let categories = [];

    if (Array.isArray(data)) {
      categories = data;
    } else if (Array.isArray(data?.data)) {
      categories = data.data;
    } else if (data?.categories && Array.isArray(data.categories)) {
      categories = data.categories;
    }

    const normalizedCategories = categories
      .map((cat) => {
        if (typeof cat === "string") return cat;
        if (typeof cat === "object" && cat !== null) {
          return cat.label || cat.name || cat.category || String(cat.id || "");
        }
        return String(cat);
      })
      .filter(Boolean);

    return Response.json({
      success: true,
      data: normalizedCategories,
    });
  } catch (error) {
    console.error("Error fetching hotel categories:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

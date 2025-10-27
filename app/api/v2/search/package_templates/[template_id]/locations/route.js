export async function GET(req, { params }) {
  try {
    const bearerToken = process.env.EXTERNAL_API_BEARER_TOKEN;
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
      `${apiBaseUrl}/search/package_templates/${templateId}/locations`,
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
          message: "Failed to fetch locations",
          error: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    let locations = [];

    if (Array.isArray(data)) {
      locations = data.flatMap((region) => {
        if (!region.cities || !Array.isArray(region.cities)) {
          return [];
        }
        return region.cities.map((city) => ({
          id: city.id,
          label: city.label,
          regionId: city.region_id || region.id,
          regionLabel: region.label,
        }));
      });
    } else if (Array.isArray(data?.data)) {
      locations = data.data.flatMap((region) => {
        if (!region.cities || !Array.isArray(region.cities)) {
          return [];
        }
        return region.cities.map((city) => ({
          id: city.id,
          label: city.label,
          regionId: city.region_id || region.id,
          regionLabel: region.label,
        }));
      });
    }

    locations.sort((a, b) => a.label.localeCompare(b.label));

    return Response.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
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

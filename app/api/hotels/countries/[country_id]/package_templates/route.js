import { getApiToken } from '@/lib/utils.server';

export async function GET(req, { params }) {
  try {
    const bearerToken = await getApiToken();
    const apiBaseUrl = process.env.EXTERNAL_API_BASE_URL;
    const airportCityFrom = process.env.EXTERNAL_API_AIRPORT_CITY_FROM;

    if (!bearerToken || !apiBaseUrl || !airportCityFrom) {
      return Response.json(
        {
          success: false,
          message: "Missing required environment variables",
        },
        { status: 500 }
      );
    }

    const countryId = params?.country_id;
    if (!countryId) {
      return Response.json(
        { success: false, message: "country_id is required" },
        { status: 400 }
      );
    }

    const url = new URL(
      `${apiBaseUrl}/api/v2/search/countries/${encodeURIComponent(
        countryId
      )}/package_templates`
    );
    url.searchParams.append("airport_city_from", airportCityFrom);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          message: `Upstream error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      success: true,
      message: "Package templates fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching package templates:", error);
    return Response.json(
      {
        success: false,
        message: "Error fetching package templates",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

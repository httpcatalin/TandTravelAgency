export async function GET(req) {
  try {
    const bearerToken = process.env.EXTERNAL_API_BEARER_TOKEN;
    const apiBaseUrl = process.env.EXTERNAL_API_BASE_URL;
    const airportCityFrom = process.env.EXTERNAL_API_AIRPORT_CITY_FROM;

    if (!bearerToken || !apiBaseUrl || !airportCityFrom) {
      throw new Error("Missing required environment variables");
    }

    // Build the URL with query parameters
    const url = new URL(`${apiBaseUrl}/search/countries`);
    url.searchParams.append("airport_city_from", airportCityFrom);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return Response.json({
      success: true,
      message: "Countries fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return Response.json(
      {
        success: false,
        message: "Error fetching countries",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

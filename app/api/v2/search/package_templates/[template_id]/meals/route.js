import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { template_id } = params;

    if (!template_id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.EXTERNAL_API_BASE_URL;
    const bearerToken = process.env.EXTERNAL_API_BEARER_TOKEN;

    if (!baseUrl || !bearerToken) {
      console.error("Missing environment variables:", {
        baseUrl: !!baseUrl,
        bearerToken: !!bearerToken,
      });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const url = `${baseUrl}/search/package_templates/${template_id}/meals`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("OBS API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch meals" },
        { status: response.status }
      );
    }

    const meals = await response.json();

    let normalizedMeals = [];

    if (Array.isArray(meals)) {
      normalizedMeals = meals
        .map((meal) => {
          if (typeof meal === "string") return meal.trim();
          if (typeof meal === "object" && meal !== null) {
            return meal.label || meal.name || meal.id || "";
          }
          return "";
        })
        .filter((meal) => meal.length > 0);
    }

    normalizedMeals.sort((a, b) => a.localeCompare(b));

    return NextResponse.json(normalizedMeals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

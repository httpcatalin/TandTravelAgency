"use client";

import { useState, useEffect } from "react";

export function useLocations(templateId) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!templateId) {
      setLoading(false);
      return;
    }

    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/v2/search/package_templates/${templateId}/locations`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        const data = await response.json();

        const locationList = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        setLocations(locationList);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [templateId]);

  return { locations, loading, error };
}

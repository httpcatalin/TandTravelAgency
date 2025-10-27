"use client";

import { useState, useEffect } from "react";

export function useMeals(templateId) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!templateId) {
      setLoading(false);
      return;
    }

    const fetchMeals = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/v2/search/package_templates/${templateId}/meals`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch meals: ${response.statusText}`);
        }

        const data = await response.json();
        setMeals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching meals:", err);
        setError(err.message);
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [templateId]);

  return { meals, loading, error };
}

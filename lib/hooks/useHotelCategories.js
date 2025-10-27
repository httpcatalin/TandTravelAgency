"use client";

import { useState, useEffect } from "react";

export function useHotelCategories(templateId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!templateId) {
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/v2/search/package_templates/${templateId}/hotel_categories`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch hotel categories");
        }

        const data = await response.json();

        let categoryList = [];

        if (Array.isArray(data?.data)) {
          categoryList = data.data;
        } else if (Array.isArray(data)) {
          categoryList = data;
        }

        const normalizedCategories = categoryList
          .map((cat) => {
            if (typeof cat === "string") return cat;
            if (typeof cat === "object" && cat !== null) {
              return (
                cat.label || cat.name || cat.category || String(cat.id || "")
              );
            }
            return String(cat);
          })
          .filter(Boolean);

        setCategories(normalizedCategories);
      } catch (err) {
        console.error("Error fetching hotel categories:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [templateId]);

  return { categories, loading, error };
}

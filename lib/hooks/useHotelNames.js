"use client";

import { useMemo } from "react";

export function useHotelNames(packages) {
  const hotelNames = useMemo(() => {
    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return [];
    }

    const namesSet = new Set();

    packages.forEach((pkg) => {
      const hotelName = pkg.__raw?.accommodation?.hotel?.name;
      if (hotelName && typeof hotelName === "string" && hotelName.trim()) {
        namesSet.add(hotelName.trim());
      }
    });

    return Array.from(namesSet).sort((a, b) => a.localeCompare(b));
  }, [packages]);

  return hotelNames;
}

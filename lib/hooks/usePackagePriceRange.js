"use client";

import { useMemo } from "react";

export function usePackagePriceRange(packages) {
  const priceRange = useMemo(() => {
    if (!packages || packages.length === 0) {
      return { minPrice: 0, maxPrice: 10000 };
    }

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    packages.forEach((pkg) => {
      const price = pkg.__raw?.price?.amount;
      if (price != null && !isNaN(price)) {
        const priceNum = Number(price);
        if (priceNum < minPrice) minPrice = priceNum;
        if (priceNum > maxPrice) maxPrice = priceNum;
      }
    });

    if (minPrice === Infinity || maxPrice === -Infinity) {
      return { minPrice: 0, maxPrice: 10000 };
    }

    minPrice = Math.floor(minPrice / 10) * 10;
    maxPrice = Math.ceil(maxPrice / 10) * 10;

    return { minPrice, maxPrice };
  }, [packages]);

  return priceRange;
}

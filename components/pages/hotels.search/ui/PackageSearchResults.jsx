"use client";

import { useState, useEffect } from "react";
import PackageResultCard from "@/components/pages/hotels.search/ui/PackageResultCard";
import { EmptyResult } from "@/components/EmptyResult";
import { HotelsFilter } from "@/components/pages/hotels.search/sections/HotelsFilter";
import { useSelector, useDispatch } from "react-redux";
import { useHotelNames } from "@/lib/hooks/useHotelNames";
import { usePackagePriceRange } from "@/lib/hooks/usePackagePriceRange";
import {
  setDefaultStayFilters,
  setStayFilter,
} from "@/reduxStore/features/stayFormSlice";

export function PackageSearchResults({ initialPackages, searchParams }) {
  const stayState = useSelector((state) => state.stayForm.value);
  const dispatch = useDispatch();
  const [filteredPackages, setFilteredPackages] = useState(initialPackages);

  const availableHotels = useHotelNames(initialPackages);

  const { minPrice, maxPrice } = usePackagePriceRange(initialPackages);

  useEffect(() => {
    const updates = {};
    if (availableHotels.length > 0) {
      updates.availableHotels = availableHotels;
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      updates.priceRange = [minPrice, maxPrice];
    }
    if (Object.keys(updates).length > 0) {
      dispatch(setDefaultStayFilters(updates));
      if (minPrice !== undefined && maxPrice !== undefined) {
        dispatch(setStayFilter({ priceRange: [minPrice, maxPrice] }));
      }
    }
  }, [availableHotels, minPrice, maxPrice, dispatch]);

  const mealMatchesFilter = (mealName, selectedMeal) => {
    if (!mealName || !selectedMeal) return false;

    const mealUpper = mealName.toUpperCase();
    const selectedUpper = selectedMeal.toUpperCase();

    if (selectedUpper === "RO") {
      return (
        mealUpper === "RO" ||
        mealUpper.includes("BED ONLY") ||
        mealUpper.includes("ROOM RATE")
      );
    }

    if (selectedUpper === "HB") {
      return mealUpper === "HB" || mealUpper.includes("HALF BOARD");
    }

    if (selectedUpper === "FB") {
      return (
        mealUpper === "FB" ||
        mealUpper.includes("FULL BOARD+") ||
        mealUpper.includes("FULL BOARD")
      );
    }

    if (selectedUpper === "BB") {
      return mealUpper === "BB" || mealUpper.includes("BED AND BREAKFAST");
    }

    if (selectedUpper.includes("AI AND BETTER")) {
      return (
        mealUpper.includes("ALL INCLUSIVE") ||
        mealUpper.includes("ULTRA ALL INCLUSIVE") ||
        mealUpper === "AI"
      );
    }

    return mealUpper === selectedUpper;
  };

  useEffect(() => {
    if (!initialPackages || initialPackages.length === 0) {
      setFilteredPackages([]);
      return;
    }

    const selectedCategories = stayState.filters?.categories || [];
    const selectedLocations = stayState.filters?.locations || [];
    const selectedHotels = stayState.filters?.hotels || [];
    const selectedMeals = stayState.filters?.meals || [];
    const selectedPriceRange = stayState.filters?.priceRange || [
      minPrice,
      maxPrice,
    ];

    const filtered = initialPackages.filter((pkg) => {
      const hotelData = pkg.__raw?.accommodation?.hotel;
      if (!hotelData) return false;

      if (selectedCategories.length > 0) {
        const category = hotelData.category;
        if (!category) return false;

        const categoryMatches = selectedCategories.some((selectedCat) => {
          const catUpper = category.toUpperCase();
          const selectedUpper = selectedCat.toUpperCase();

          if (catUpper === selectedUpper) return true;

          if (catUpper.startsWith(selectedUpper)) return true;

          if (catUpper.includes(selectedUpper)) return true;

          return false;
        });

        if (!categoryMatches) return false;
      }

      if (selectedLocations.length > 0) {
        const hotelCity = hotelData.city;
        if (!hotelCity) return false;

        const locationMatches = selectedLocations.some(
          (selectedLoc) => hotelCity.toUpperCase() === selectedLoc.toUpperCase()
        );

        if (!locationMatches) return false;
      }

      if (selectedHotels.length > 0) {
        const hotelName = hotelData.name;
        if (!hotelName) return false;

        const hotelMatches = selectedHotels.some(
          (selectedHotel) =>
            hotelName.toUpperCase() === selectedHotel.toUpperCase()
        );

        if (!hotelMatches) return false;
      }

      if (selectedMeals.length > 0) {
        const mealData = pkg.__raw?.accommodation?.meal;
        if (!mealData) {
          console.log("❌ No meal data for package:", pkg._id);
          return false;
        }

        const mealName = mealData.name || "";
        const mealFullName = mealData.full_name || "";

        console.log("🔍 Checking package:", {
          packageId: pkg._id,
          mealName,
          mealFullName,
          selectedMeals,
        });

        const mealMatches = selectedMeals.some(
          (selectedMeal) =>
            mealMatchesFilter(mealName, selectedMeal) ||
            mealMatchesFilter(mealFullName, selectedMeal)
        );

        if (!mealMatches) return false;
      }

      const packagePrice = pkg.__raw?.price?.amount;
      if (packagePrice != null) {
        const priceNum = Number(packagePrice);
        if (!isNaN(priceNum)) {
          const [minSelected, maxSelected] = selectedPriceRange;
          if (priceNum < minSelected || priceNum > maxSelected) {
            return false;
          }
        }
      }

      return true;
    });

    setFilteredPackages(filtered);
  }, [
    initialPackages,
    stayState.filters?.categories,
    stayState.filters?.locations,
    stayState.filters?.hotels,
    stayState.filters?.meals,
    stayState.filters?.priceRange,
    minPrice,
    maxPrice,
  ]);

  return (
    <>
      {!filteredPackages?.length ? (
        <EmptyResult className={"h-full w-full"} message="No Packages Found" />
      ) : (
        <div className="space-y-4">
          {filteredPackages.map((hotel) => (
            <PackageResultCard
              key={hotel._id}
              item={hotel.__raw}
              imageUrl={hotel.__giataImage || hotel.image}
            />
          ))}
        </div>
      )}
    </>
  );
}

"use client";

import { Slider } from "@/components/ui/slider";
import { Dropdown } from "@/components/local-ui/Dropdown";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterRating } from "@/components/local-ui/FilterRating";

import { cn } from "@/lib/utils";
import { useState, useEffect, use, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  setStayFilter,
  setStayForm,
  setDefaultStayFilters,
  resetStayFilters,
} from "@/reduxStore/features/stayFormSlice";
import { useRouter } from "next/navigation";
import validateHotelSearchParams from "@/lib/zodSchemas/hotelSearchParams";
import { jumpTo } from "@/components/local-ui/Jumper";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useHotelCategories } from "@/lib/hooks/useHotelCategories";
import { useLocations } from "@/lib/hooks/useLocations";
import { useMeals } from "@/lib/hooks/useMeals";

export function HotelsFilter({
  className,
  filters = {},
  hotelSearchParams = {},
  defaultFilterValuesPromise = new Promise(() => {}),
  onFilterChange,
  isPackageMode = false,
}) {
  const router = useRouter();
  const [filter, setFilter] = useState(false);

  const defaultFilterDB = use(defaultFilterValuesPromise);
  const [isFilterLoading, setIsFilterLoading] = useState(true);

  const [amenitiesLimit, setAmenitiesLimit] = useState(10);
  const [featuresLimit, setFeaturesLimit] = useState(10);
  const [locationsLimit, setLocationsLimit] = useState(10);
  const [hotelsLimit, setHotelsLimit] = useState(10);
  const [mealsLimit, setMealsLimit] = useState(10);

  const dispatch = useDispatch();
  const stayState = useSelector((state) => state.stayForm.value);
  const hotelFilterState = stayState.filters;
  const hotelDefaultFilterState = stayState.defaultFilterValues;

  const isInPackageMode =
    isPackageMode ||
    !!(
      stayState?.countryId &&
      stayState?.packageTemplate?.id &&
      !stayState?.destination?.city
    );

  const { categories: hotelCategories, loading: categoriesLoading } =
    useHotelCategories(isInPackageMode ? stayState?.packageTemplate?.id : null);

  const { locations, loading: locationsLoading } = useLocations(
    isInPackageMode ? stayState?.packageTemplate?.id : null
  );

  const { meals, loading: mealsLoading } = useMeals(
    isInPackageMode ? stayState?.packageTemplate?.id : null
  );

  const debouncedFilterChange = useDebounce((updatedFilters) => {
    if (onFilterChange && isInPackageMode) {
      onFilterChange(updatedFilters);
    } else if (!isInPackageMode) {
      handleApplyFilters();
    }
  }, 400);

  const handleInstantFilterUpdate = useCallback(
    (filterUpdates) => {
      dispatch(setStayFilter(filterUpdates));
      const updatedFilters = {
        ...hotelFilterState,
        ...filterUpdates,
      };
      debouncedFilterChange(updatedFilters);
    },
    [dispatch, hotelFilterState, debouncedFilterChange]
  );

  useEffect(() => {
    dispatch(setDefaultStayFilters(defaultFilterDB));
    setIsFilterLoading(false);
    return () => {
      setIsFilterLoading(true);
    };
  }, [defaultFilterDB, dispatch]);

  useEffect(() => {
    if (meals.length > 0) {
      dispatch(setDefaultStayFilters({ meals }));
    }
  }, [meals, dispatch]);

  useEffect(() => {
    dispatch(
      setStayFilter({
        priceRange: defaultFilterDB?.priceRange || [0, 2000],
        ...filters,
        amenities: filters?.amenities
          ? filters?.amenities.map((el) => "amenity-" + el)
          : [],
        features: filters?.features
          ? filters?.features.map((el) => "feature-" + el)
          : [],
      })
    );
  }, [filters, dispatch, defaultFilterDB?.priceRange]);

  function handleCheckboxChange(checked, groupName, name) {
    if (checked) {
      dispatch(
        setStayFilter({
          [groupName]: [...stayState?.filters[groupName], name],
        })
      );
    } else {
      dispatch(
        setStayFilter({
          [groupName]: stayState?.filters[groupName].filter(
            (item) => item !== name
          ),
        })
      );
    }
  }

  function handleApplyFilters() {
    const isPackageMode = !!(
      stayState?.countryId &&
      stayState?.packageTemplate?.id &&
      !stayState?.destination?.city
    );
    if (!isPackageMode) {
      const validateStayForm = validateHotelSearchParams({
        city: stayState.destination.city,
        country: stayState.destination.country,
        checkIn: stayState.checkIn,
        checkOut: stayState.checkOut,
        rooms: stayState.rooms,
        guests: stayState.guests,
      });
      if (validateStayForm.success === false) {
        dispatch(setStayForm({ errors: validateStayForm.errors }));
        return;
      }
    }

    const sp = new URLSearchParams(hotelSearchParams);

    for (const [key, value] of Object.entries(hotelFilterState)) {
      sp.set("filter_" + key, value.join(","));
    }

    router.replace(`/hotels/search/${encodeURIComponent(sp.toString())}`, {
      scroll: false,
    });
    jumpTo("hotelResults");
  }

  function handleResetFilters() {
    dispatch(resetStayFilters());
  }

  return isFilterLoading ? (
    <Loading className={className} />
  ) : (
    <section
      className={cn(
        "relative w-full border-none pr-[12px] lg:w-[400px] lg:border-r-[1px]",
        className
      )}
    >
      <div className="mb-[24px] flex items-center justify-between font-semibold text-secondary">
        <Button
          className="p-0 text-[1.25rem] max-lg:w-full max-lg:bg-primary/30"
          variant={"link"}
          onClick={() => {
            if (document.body.clientWidth < 1024) {
              setFilter(!filter);
            }
          }}
          asChild
        >
          <h2>Filters</h2>
        </Button>
        <Button
          className="p-0 max-lg:hidden"
          variant={"link"}
          onClick={handleResetFilters}
          asChild
        >
          <h2>Reset</h2>
        </Button>
      </div>
      <div
        className={cn(
          "w-full rounded-lg max-lg:bg-white max-lg:p-5 max-lg:shadow-md",
          filter === false && "max-lg:hidden"
        )}
      >
        <div className={"flex justify-end"}>
          <Button
            type="submit"
            form="flightForm"
            variant={"link"}
            className="block h-auto px-0 lg:hidden"
            onClick={handleApplyFilters}
          >
            reset filter
          </Button>
        </div>
        <div className="space-y-6">
          {isInPackageMode && (
            <>
              <Dropdown title={"Price Range"} open>
                <div className="my-5">
                  <Slider
                    name="package-price-slider"
                    min={+hotelDefaultFilterState?.priceRange?.[0] || 0}
                    max={+hotelDefaultFilterState?.priceRange?.[1] || 10000}
                    value={stayState.filters.priceRange}
                    step={10}
                    onValueChange={(value) => {
                      handleInstantFilterUpdate({ priceRange: value });
                    }}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-secondary/70">
                        Min Budget
                      </span>
                      <span className="text-lg font-bold text-tertiary">
                        ${stayState.filters.priceRange?.[0] || 0}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-secondary/70">
                        Max Budget
                      </span>
                      <span className="text-lg font-bold text-tertiary">
                        ${stayState.filters.priceRange?.[1] || 10000}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-secondary/60">
                    Showing packages from $
                    {hotelDefaultFilterState?.priceRange?.[0] || 0} to $
                    {hotelDefaultFilterState?.priceRange?.[1] || 10000}
                  </div>
                </div>
              </Dropdown>

              <Dropdown title={"Hotel Category"} open>
                <div className="flex flex-col gap-3">
                  {categoriesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ) : (
                    hotelCategories.map((category) => {
                      const categoryStr = String(category);
                      const categoryId = `category-${categoryStr}`;
                      const isChecked =
                        stayState.filters.categories?.includes(categoryStr) ||
                        false;

                      return (
                        <Checkbox
                          key={categoryId}
                          id={categoryId}
                          name={categoryId}
                          label={categoryStr}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const currentCategories =
                              stayState.filters.categories || [];
                            const updatedCategories = checked
                              ? [...currentCategories, categoryStr]
                              : currentCategories.filter(
                                  (c) => c !== categoryStr
                                );
                            handleInstantFilterUpdate({
                              categories: updatedCategories,
                            });
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </Dropdown>

              <Dropdown title={"Location"} open={false}>
                <div className="flex flex-col gap-3">
                  {locationsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ) : (
                    <>
                      {locations.slice(0, locationsLimit).map((location) => {
                        const locationId = `location-${location.id}`;
                        const isChecked =
                          stayState.filters.locations?.includes(
                            location.label
                          ) || false;

                        return (
                          <Checkbox
                            key={locationId}
                            id={locationId}
                            name={locationId}
                            label={location.label}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const currentLocations =
                                stayState.filters.locations || [];
                              const updatedLocations = checked
                                ? [...currentLocations, location.label]
                                : currentLocations.filter(
                                    (loc) => loc !== location.label
                                  );
                              handleInstantFilterUpdate({
                                locations: updatedLocations,
                              });
                            }}
                          />
                        );
                      })}
                      {locations.length > 10 && (
                        <Button
                          type={"button"}
                          variant={"ghost"}
                          className="h-min w-min p-0 text-tertiary"
                          onClick={() => {
                            if (locationsLimit < locations.length) {
                              setLocationsLimit(locations.length);
                            } else {
                              setLocationsLimit(10);
                            }
                          }}
                        >
                          {locationsLimit < locations.length
                            ? `+${Math.abs(locations.length - locationsLimit)} more`
                            : "Show less"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Dropdown>

              <Dropdown title={"Hotels"} open={false}>
                <div className="flex flex-col gap-3">
                  {!hotelDefaultFilterState?.availableHotels?.length ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ) : (
                    <>
                      {hotelDefaultFilterState.availableHotels
                        .slice(0, hotelsLimit)
                        .map((hotelName) => {
                          const hotelId = `hotel-${hotelName.replace(/\s+/g, "-").toLowerCase()}`;
                          const isChecked =
                            stayState.filters.hotels?.includes(hotelName) ||
                            false;

                          return (
                            <Checkbox
                              key={hotelId}
                              id={hotelId}
                              name={hotelId}
                              label={hotelName}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentHotels =
                                  stayState.filters.hotels || [];
                                const updatedHotels = checked
                                  ? [...currentHotels, hotelName]
                                  : currentHotels.filter(
                                      (hotel) => hotel !== hotelName
                                    );
                                handleInstantFilterUpdate({
                                  hotels: updatedHotels,
                                });
                              }}
                            />
                          );
                        })}
                      {hotelDefaultFilterState.availableHotels.length > 10 && (
                        <Button
                          type={"button"}
                          variant={"ghost"}
                          className="h-min w-min p-0 text-tertiary"
                          onClick={() => {
                            if (
                              hotelsLimit <
                              hotelDefaultFilterState.availableHotels.length
                            ) {
                              setHotelsLimit(
                                hotelDefaultFilterState.availableHotels.length
                              );
                            } else {
                              setHotelsLimit(10);
                            }
                          }}
                        >
                          {hotelsLimit <
                          hotelDefaultFilterState.availableHotels.length
                            ? `+${Math.abs(
                                hotelDefaultFilterState.availableHotels.length -
                                  hotelsLimit
                              )} more`
                            : "Show less"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Dropdown>

              <Dropdown title={"Meals"} open={false}>
                <div className="flex flex-col gap-3">
                  {mealsLoading ? (
                    <Skeleton className="h-6 w-full" />
                  ) : !hotelDefaultFilterState?.meals?.length ? (
                    <Skeleton className="h-6 w-full" />
                  ) : (
                    <>
                      {hotelDefaultFilterState.meals
                        .slice(0, mealsLimit)
                        .map((mealType) => {
                          const mealId = `meal-${mealType.replace(/\s+/g, "-").toLowerCase()}`;
                          const isChecked =
                            stayState.filters.meals?.includes(mealType) ||
                            false;
                          return (
                            <Checkbox
                              key={mealId}
                              id={mealId}
                              label={mealType}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentMeals =
                                  stayState.filters.meals || [];
                                const updatedMeals = checked
                                  ? [...currentMeals, mealType]
                                  : currentMeals.filter(
                                      (meal) => meal !== mealType
                                    );
                                handleInstantFilterUpdate({
                                  meals: updatedMeals,
                                });
                              }}
                            />
                          );
                        })}
                      {hotelDefaultFilterState.meals.length > 10 && (
                        <Button
                          type={"button"}
                          variant={"ghost"}
                          className="h-min w-min p-0 text-tertiary"
                          onClick={() => {
                            if (
                              mealsLimit < hotelDefaultFilterState.meals.length
                            ) {
                              setMealsLimit(
                                hotelDefaultFilterState.meals.length
                              );
                            } else {
                              setMealsLimit(10);
                            }
                          }}
                        >
                          {mealsLimit < hotelDefaultFilterState.meals.length
                            ? `+${Math.abs(
                                hotelDefaultFilterState.meals.length -
                                  mealsLimit
                              )} more`
                            : "Show less"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Dropdown>
            </>
          )}

          {!isInPackageMode && (
            <div className="space-y-6">
              <Dropdown title={"Price per night"} open>
                <div className="my-5">
                  <Slider
                    name="hotel-price-slider"
                    min={+hotelDefaultFilterState?.priceRange?.[0]}
                    max={+hotelDefaultFilterState?.priceRange?.[1]}
                    value={stayState.filters.priceRange}
                    onValueChange={(value) => {
                      dispatch(setStayFilter({ priceRange: value }));
                    }}
                  />
                  <div className="mt-2 flex justify-between font-semibold">
                    <span>${stayState.filters.priceRange?.[0]}</span>
                    <span>${stayState.filters.priceRange?.[1]}</span>
                  </div>
                </div>
              </Dropdown>

              <Dropdown title={"Rating"} open>
                <FilterRating
                  value={stayState.filters.rates}
                  setValue={(rate) => {
                    dispatch(setStayFilter({ rates: rate }));
                  }}
                  className="justify-start"
                />
              </Dropdown>

              <Dropdown title={"Features"} open={false}>
                <div className="flex flex-col gap-3">
                  {hotelDefaultFilterState?.features
                    .slice(0, featuresLimit)
                    .map((name) => {
                      const IDfyName = "feature-" + name.trim();
                      return (
                        <Checkbox
                          key={IDfyName}
                          onCheckedChange={(checked) => {
                            handleCheckboxChange(checked, "features", IDfyName);
                          }}
                          name={IDfyName}
                          id={IDfyName}
                          label={name}
                          checked={stayState.filters.features.includes(
                            IDfyName
                          )}
                        />
                      );
                    })}
                  <Button
                    type={"button"}
                    variant={"ghost"}
                    className="h-min w-min p-0 text-tertiary"
                    onClick={() => {
                      if (
                        featuresLimit < hotelDefaultFilterState?.features.length
                      ) {
                        setFeaturesLimit(
                          hotelDefaultFilterState?.features.length
                        );
                      } else {
                        setFeaturesLimit(10);
                      }
                    }}
                  >
                    {featuresLimit < hotelDefaultFilterState?.features.length
                      ? `+${Math.abs(
                          hotelDefaultFilterState?.features.length -
                            featuresLimit
                        )} more`
                      : "Show less"}
                  </Button>
                </div>
              </Dropdown>
              <Dropdown title={"Amenities"} open={false}>
                <div className="flex flex-col gap-3">
                  {hotelDefaultFilterState?.amenities
                    .slice(0, amenitiesLimit)
                    .map((name) => {
                      const IDfyName = "amenity-" + name.trim();
                      return (
                        <Checkbox
                          key={IDfyName}
                          onCheckedChange={(checked) => {
                            handleCheckboxChange(
                              checked,
                              "amenities",
                              IDfyName
                            );
                          }}
                          name={IDfyName}
                          id={IDfyName}
                          label={name}
                          checked={stayState.filters.amenities.includes(
                            IDfyName
                          )}
                        />
                      );
                    })}
                  <Button
                    type={"button"}
                    variant={"ghost"}
                    className="h-min w-min p-0 text-tertiary"
                    onClick={() => {
                      if (
                        amenitiesLimit <
                        hotelDefaultFilterState?.amenities.length
                      ) {
                        setAmenitiesLimit(
                          hotelDefaultFilterState?.amenities.length
                        );
                      } else {
                        setAmenitiesLimit(10);
                      }
                    }}
                  >
                    {amenitiesLimit < hotelDefaultFilterState?.amenities.length
                      ? `+${Math.abs(
                          hotelDefaultFilterState?.amenities.length -
                            amenitiesLimit
                        )} more`
                      : "Show less"}
                  </Button>
                </div>
              </Dropdown>
              <div className="flex justify-end">
                <Button
                  type={"button"}
                  className={"mt-4 bg-primary"}
                  onClick={handleApplyFilters}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Loading({ className }) {
  return (
    <section
      className={cn(
        "relative w-full border-none pr-[12px] lg:w-[400px] lg:border-r-[1px]",
        className
      )}
    >
      <div className="mb-[24px] flex items-center justify-between font-semibold text-secondary">
        <Button
          className="p-0 text-[1.25rem] max-lg:w-full max-lg:bg-primary/30"
          variant={"link"}
          disabled
          asChild
        >
          <h2>Filters</h2>
        </Button>
      </div>
      <div className="w-full rounded-lg max-lg:bg-white max-lg:p-5 max-lg:shadow-md">
        <div className="space-y-4">
          <Skeleton className={"h-4 w-24"} />
          <Skeleton className={"h-8 w-full"} />
          <Skeleton className={"h-4 w-20"} />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className={"h-4 w-full"} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

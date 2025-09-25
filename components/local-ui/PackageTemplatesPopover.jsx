"use client";
import { ApiSearchInputPopover } from "./ApiSearchInputPopover";
import { cn, objDeepCompare } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

export function PackageTemplatesPopover({
  isLoading,
  className,
  fetchInputs,
  defaultSelected,
  excludeVals = [],
  getSelected = () => {},
}) {
  function renderSelectedResult(obj) {
    if (isLoading) {
      return (
        <div disabled={true} className={cn("rounded border p-2", className)}>
          <Skeleton className={"mb-2 h-8 w-[180px]"} />
          <Skeleton className={"h-4 w-[120px]"} />
        </div>
      );
    }

    return (
      <div className={cn("rounded border p-2", className)}>
        <div className={"text-2xl font-bold"}>{obj?.label || "Packages"}</div>
        {obj?.description && <div className={"text-sm"}>{obj.description}</div>}
      </div>
    );
  }

  function renderSearchResults(
    result,
    setOpen = () => {},
    setSelected = () => {}
  ) {
    if (result.success === false) {
      return (
        <div className="flex h-full items-center justify-center p-2 text-center text-sm font-bold">
          {result.message}
        </div>
      );
    }

    const list = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.data?.data)
        ? result.data.data
        : [];

    const filtered = list.filter((obj) => {
      return !excludeVals.some((exObj) => objDeepCompare(obj, exObj));
    });

    if (filtered.length === 0) {
      return (
        <div className="flex h-full items-center justify-center p-2 text-center text-sm font-bold">
          No results found
        </div>
      );
    }

    return filtered.map((obj, i) => (
      <div
        onClick={() => {
          setSelected(obj);
          setOpen(false);
        }}
        key={i}
        className="flex cursor-pointer items-center gap-2 rounded-md border p-2 hover:bg-muted"
      >
        <div>
          <div className={"text-md font-bold"}>{obj.label}</div>
          {obj?.subtitle && <div className={"text-xs"}>{obj.subtitle}</div>}
        </div>
      </div>
    ));
  }

  return (
    <ApiSearchInputPopover
      isLoading={isLoading}
      fetchInputs={fetchInputs}
      defaultSelected={defaultSelected}
      renderSelectedResult={renderSelectedResult}
      renderSearchResults={renderSearchResults}
      getSelectedResult={getSelected}
    />
  );
}

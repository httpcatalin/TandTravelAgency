import { Button } from "../ui/button";
export function RatingShow({ rating }) {
  const numRating = Number(rating);
  const isValidRating = Number.isFinite(numRating) && numRating > 0;

  return (
    <Button variant="outline" size="sm" className="rounded-lg px-3 py-1">
      {isValidRating ? numRating.toFixed(1) : "N/A"}
    </Button>
  );
}

import { Star } from "lucide-react";

type RatingStarsProps = {
  rating: number;
  reviewCount: number;
  className?: string;
};

export function RatingStars({
  rating,
  reviewCount,
  className
}: RatingStarsProps) {
  if (reviewCount <= 0) return null;

  const filled = Math.round(Math.min(5, Math.max(0, rating)));

  return (
    <p className={className ? `xp-rating ${className}` : "xp-rating"}>
      <span className="xp-stars" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={16}
            fill={index < filled ? "currentColor" : "none"}
            strokeWidth={1.75}
          />
        ))}
      </span>
      <span>
        {rating.toFixed(1)} ({reviewCount}{" "}
        {reviewCount === 1 ? "review" : "reviews"})
      </span>
    </p>
  );
}

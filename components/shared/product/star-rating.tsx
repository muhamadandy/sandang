import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  className?: string;
};

// Menampilkan 5 bintang; rating dibulatkan ke bintang terdekat
const StarRating = ({ rating, className }: StarRatingProps) => {
  const filled = Math.round(rating);

  return (
    <span
      role="img"
      aria-label={`Nilai ${rating} dari 5 bintang`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "size-4",
            n <= filled
              ? "fill-accent text-accent"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
};

export default StarRating;

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { deleteMyReview, saveReview } from "@/lib/actions/review.actions";
import { cn } from "@/lib/utils";
import { reviewFormSchema } from "@/lib/validator";

type ReviewFormProps = {
  productId: string;
  // Ulasan lama milik pengguna (null bila belum pernah mengulas)
  initial: { rating: number; comment: string } | null;
};

const ReviewForm = ({ productId, initial }: ReviewFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [error, setError] = useState<string | null>(null);

  const isEditing = initial !== null;
  const shown = hover || rating;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validasi di browser untuk pesan cepat (server memvalidasi ulang)
    const parsed = reviewFormSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data ulasan tidak valid.");
      return;
    }

    startTransition(async () => {
      const res = await saveReview(productId, parsed.data);
      toast.add({
        title: res.message,
        type: res.success ? "success" : "error",
      });
      if (res.success) router.refresh();
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Hapus ulasan Anda?")) return;

    startTransition(async () => {
      const res = await deleteMyReview(productId);
      toast.add({
        title: res.message,
        type: res.success ? "success" : "error",
      });
      if (res.success) {
        setRating(0);
        setComment("");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Nilai Anda</p>
        <div
          role="radiogroup"
          aria-label="Nilai bintang"
          className="flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} bintang`}
              disabled={isPending}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  n <= shown
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="review-comment" className="text-sm font-medium">
          Ulasan
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={isPending}
          rows={4}
          maxLength={1000}
          placeholder="Ceritakan pengalaman Anda dengan produk ini"
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <p className="text-right text-xs text-muted-foreground">
          {comment.length}/1000
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader className="size-4 animate-spin" />}
          {isEditing ? "Simpan Perubahan" : "Kirim Ulasan"}
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleDelete}
          >
            Hapus Ulasan
          </Button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;

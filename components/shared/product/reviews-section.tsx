import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import ReviewForm from "@/components/shared/product/review-form";
import StarRating from "@/components/shared/product/star-rating";
import {
  getProductReviews,
  getReviewEligibility,
  getReviewSummary,
} from "@/lib/actions/review.actions";
import { cn } from "@/lib/utils";

type ReviewsSectionProps = {
  productId: string;
  slug: string;
  page: number;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeZone: "Asia/Jakarta",
});

const ReviewsSection = async ({
  productId,
  slug,
  page,
}: ReviewsSectionProps) => {
  const [summary, list, eligibility] = await Promise.all([
    getReviewSummary(productId),
    getProductReviews(productId, page),
    getReviewEligibility(productId),
  ]);

  const basePath = `/product/${slug}`;

  return (
    <section id="ulasan" className="mt-12 scroll-mt-20 space-y-6">
      <h2 className="h2-bold">Ulasan Pelanggan</h2>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Ringkasan */}
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold">
              {summary.count === 0 ? "-" : summary.average.toFixed(1)}
            </span>
            <div className="space-y-1 pb-1">
              <StarRating rating={summary.average} />
              <p className="text-sm text-muted-foreground">
                {summary.count} ulasan
              </p>
            </div>
          </div>

          <ul className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star - 1];
              const percent =
                summary.count === 0 ? 0 : (count / summary.count) * 100;

              return (
                <li key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-12 shrink-0 text-muted-foreground">
                    {star} bintang
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-muted-foreground">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Formulir dan daftar ulasan */}
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-lg border p-4">
            {eligibility.status === "guest" && (
              <p className="text-sm text-muted-foreground">
                <Link
                  href="/sign-in"
                  className="font-medium text-primary hover:underline"
                >
                  Masuk
                </Link>{" "}
                untuk memberi ulasan.
              </p>
            )}

            {eligibility.status === "not-purchased" && (
              <p className="text-sm text-muted-foreground">
                Hanya pembeli yang sudah membayar produk ini yang dapat memberi
                ulasan.
              </p>
            )}

            {eligibility.status === "can-review" && (
              <div className="space-y-3">
                <h3 className="font-semibold">
                  {eligibility.myReview ? "Ulasan Anda" : "Tulis ulasan"}
                </h3>
                <ReviewForm
                  productId={productId}
                  initial={eligibility.myReview}
                />
              </div>
            )}
          </div>

          {list.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada ulasan untuk produk ini.
            </p>
          ) : (
            <ul className="divide-y">
              {list.reviews.map((review) => (
                <li key={review.id} className="space-y-2 py-4 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        {review.userName}
                      </span>
                      {review.isMine && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          Ulasan Anda
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Pembeli terverifikasi
                      </span>
                    </div>
                    <time
                      dateTime={review.createdAt.toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {dateFormatter.format(review.createdAt)}
                    </time>
                  </div>
                  <StarRating rating={review.rating} />
                  <p className="whitespace-pre-line break-words text-sm">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {list.totalPages > 1 && (
            <nav
              aria-label="Halaman ulasan"
              className="flex items-center justify-between gap-3"
            >
              {list.page > 1 ? (
                <Link
                  href={`${basePath}?reviews=${list.page - 1}#ulasan`}
                  scroll={false}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sebelumnya
                </Link>
              ) : (
                <span
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  Sebelumnya
                </span>
              )}

              <span className="text-sm text-muted-foreground">
                Halaman {list.page} dari {list.totalPages}
              </span>

              {list.page < list.totalPages ? (
                <Link
                  href={`${basePath}?reviews=${list.page + 1}#ulasan`}
                  scroll={false}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Berikutnya
                </Link>
              ) : (
                <span
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  Berikutnya
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;

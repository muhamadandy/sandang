"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import type { FeaturedSlide } from "@/lib/actions/featured.actions";

const AUTOPLAY_MS = 5000;

const FeaturedCarousel = ({ slides }: { slides: FeaturedSlide[] }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (target: number) => {
      const track = trackRef.current;
      if (!track) return;

      // Berputar: setelah slide terakhir kembali ke pertama, dan sebaliknya
      const next = (target + slides.length) % slides.length;
      track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    },
    [slides.length],
  );

  // Perbarui titik penunjuk mengikuti posisi geser
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  // Putar otomatis (berhenti saat disorot/fokus atau bila pengguna minta kurangi gerakan)
  useEffect(() => {
    if (slides.length < 2 || paused) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, paused, slides.length, goTo]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Produk unggulan"
      className="relative mb-10 overflow-hidden rounded-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <Link
            key={slide.id}
            href={`/product/${slide.slug}`}
            aria-label={`${slide.name}, ${formatRupiah(slide.price)}`}
            className="relative aspect-[16/9] w-full shrink-0 snap-center md:aspect-[21/9]"
          >
            <Image
              src={slide.image}
              alt={slide.name}
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover"
            />

            {/* Gelapkan bagian bawah supaya teks selalu terbaca */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 space-y-1 p-4 text-white md:p-8">
              <p className="text-xs uppercase tracking-wide text-white/80">
                {slide.brand}
              </p>
              <h2 className="line-clamp-2 text-xl font-bold md:text-3xl">
                {slide.name}
              </h2>
              <p className="text-sm font-medium md:text-lg">
                {formatRupiah(slide.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          {/* Tombol panah: hanya di layar sedang ke atas, di HP cukup digeser */}
          <Button
            variant="secondary"
            size="icon"
            aria-label="Sebelumnya"
            className="absolute left-3 inset-y-0 my-auto hidden size-9 rounded-full md:flex"
            onClick={() => goTo(index - 1)}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Berikutnya"
            className="absolute right-3 inset-y-0 my-auto hidden size-9 rounded-full md:flex"
            onClick={() => goTo(index + 1)}
          >
            <ChevronRight className="size-5" />
          </Button>

          {/* Titik penunjuk */}
          <div className="absolute right-4 bottom-3 flex gap-1.5 md:bottom-5 md:right-8">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ke slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default FeaturedCarousel;

"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ProductImages = ({
  images,
  name,
}: {
  images: string[];
  name: string;
}) => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <Image
          src={images[current]}
          alt={name}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Lihat gambar ${index + 1}`}
              aria-current={current === index}
              className={cn(
                "relative size-20 overflow-hidden rounded-lg border-2 bg-muted",
                current === index
                  ? "border-primary"
                  : "border-transparent hover:border-border",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;

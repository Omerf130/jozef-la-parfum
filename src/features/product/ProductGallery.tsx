"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./ProductGallery.module.scss";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const main = images[active];

  return (
    <div className={styles.gallery}>
      <div className={styles.mainWrap}>
        {main ? (
          <Image
            src={main}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.mainImg}
            priority
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            ✦
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div className={styles.thumbs}>
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              className={`${styles.thumb} ${i === active ? styles.activeThumb : ""}`}
              aria-label={`תמונה ${i + 1}`}
            >
              <Image src={img} alt="" fill sizes="80px" className={styles.thumbImg} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

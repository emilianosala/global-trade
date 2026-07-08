"use client";

import React from "react";
import * as Icon from "@/components/ui/Icons";
import { ProductCard } from "@/components/product/ProductCard";
import type { SectionProduct } from "@/components/home/HomeSections";

/**
 * Carrusel horizontal de productos para las secciones de la home (Destacados /
 * Más vendidos). Scroll nativo (swipe en touch) + flechas en desktop, que se
 * ocultan al llegar a cada extremo.
 */
export function ProductCarousel({
  products,
  idPrefix,
}: {
  products: SectionProduct[];
  idPrefix: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const update = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, products]);

  function scroll(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 260), behavior: "smooth" });
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={ref}
        onScroll={update}
        className="gt-carousel-track"
        style={{ display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}
      >
        {products.map((p) => (
          <div
            key={idPrefix + p.id}
            style={{ flex: "0 0 auto", display: "flex", width: "clamp(230px, 74vw, 280px)", scrollSnapAlign: "start" }}
          >
            <ProductCard
              href={p.href}
              image={p.image}
              imageSlotId={p.image ? undefined : `${idPrefix}-${p.id}`}
              category={p.category}
              name={p.name}
              sku={p.sku}
              price={p.price}
              badge={p.badge}
              outOfStock={p.outOfStock}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        ))}
      </div>

      {!atStart && <Arrow dir="left" onClick={() => scroll(-1)} />}
      {!atEnd && <Arrow dir="right" onClick={() => scroll(1)} />}
    </div>
  );
}

function Arrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === "left" ? "Anterior" : "Siguiente"}
      className="gt-hide-mobile"
      style={{
        position: "absolute",
        top: "50%",
        [dir]: -18,
        transform: "translateY(-50%)",
        width: 44,
        height: 44,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--gt-orange)",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        boxShadow: "var(--shadow-md)",
        zIndex: 2,
      }}
    >
      {dir === "left" ? <Icon.ChevronLeft size={22} /> : <Icon.ChevronRight size={22} />}
    </button>
  );
}

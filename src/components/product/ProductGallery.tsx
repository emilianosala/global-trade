"use client";

import React from "react";
import * as Icon from "@/components/ui/Icons";
import { parseVideoUrl } from "@/lib/video";
import type { ProductMedia } from "@/lib/types";

type Item = { type: "image" | "video"; url: string };

/**
 * Galería de la ficha: medio principal grande (imagen o video embebido) + fila
 * de miniaturas. Si el producto no tiene filas en product_media, cae a la
 * image_url (portada) para no romper los productos previos a la galería.
 */
export function ProductGallery({
  media,
  productName,
  fallbackImage,
  badge,
}: {
  media: ProductMedia[];
  productName: string;
  fallbackImage?: string | null;
  badge?: string | null;
}) {
  const items: Item[] = React.useMemo(() => {
    if (media.length > 0) return media.map((m) => ({ type: m.type, url: m.url }));
    if (fallbackImage) return [{ type: "image" as const, url: fallbackImage }];
    return [];
  }, [media, fallbackImage]);

  const [active, setActive] = React.useState(0);
  const current = items[Math.min(active, items.length - 1)];

  if (items.length === 0 || !current) {
    return (
      <div style={{ position: "relative", aspectRatio: "1 / 1", background: "var(--gt-black)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", overflow: "hidden" }}>
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-muted)", fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", background: "repeating-linear-gradient(45deg, #1d1d1d, #1d1d1d 12px, #202020 12px, #202020 24px)" }}>
          <Icon.PackageSearch size={40} /> Foto pendiente
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ position: "relative", aspectRatio: "1 / 1", background: "var(--gt-black)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", overflow: "hidden" }}>
        {current.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={productName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <iframe
            src={parseVideoUrl(current.url)?.embedUrl ?? ""}
            title={productName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        )}
        {badge && current.type === "image" && (
          <div style={{ position: "absolute", top: 14, left: 14, display: "inline-flex", alignItems: "center", background: "var(--gt-orange)", color: "#fff", borderRadius: "var(--radius-1)", padding: "5px 10px", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>
            {badge}
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: 8, marginTop: 12 }}>
          {items.map((it, i) => {
            const isActive = i === active;
            const video = it.type === "video" ? parseVideoUrl(it.url) : null;
            const thumb = it.type === "image" ? it.url : video?.thumbnailUrl ?? null;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Ver ${it.type === "video" ? "video" : "imagen"} ${i + 1}`}
                style={{
                  position: "relative", width: "100%", aspectRatio: "1 / 1", padding: 0, cursor: "pointer",
                  borderRadius: "var(--radius-2)", overflow: "hidden", background: "var(--gt-black)",
                  border: `2px solid ${isActive ? "var(--gt-orange)" : "var(--border-dark)"}`,
                }}
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}><Icon.PackageSearch size={20} /></span>
                )}
                {it.type === "video" && (
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)", color: "#fff", fontSize: 16 }}>▶</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { uploadImage } from "@/actions/uploads";
import { Button } from "@/components/ui/Button";
import * as Icon from "@/components/ui/Icons";
import { parseVideoUrl, isValidVideoUrl } from "@/lib/video";
import type { MediaType } from "@/lib/types";

export interface MediaItem {
  key: string;
  type: MediaType;
  url: string;
  isPrimary: boolean;
}

/**
 * Editor de la galería de un producto: subir varias imágenes, agregar videos por
 * link (YouTube/Vimeo), reordenar, y elegir la imagen principal (portada del
 * catálogo). La portada siempre es una imagen; los videos no pueden serlo.
 */
export function MediaManager({
  value,
  onChange,
  onError,
  disabled = false,
}: {
  value: MediaItem[];
  onChange: (m: MediaItem[]) => void;
  onError: (msg: string | null) => void;
  disabled?: boolean;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState("");

  // Garantiza exactamente una imagen principal (la primera si ninguna lo es).
  function normalizePrimary(list: MediaItem[]): MediaItem[] {
    const firstImageKey = list.find((m) => m.type === "image")?.key ?? null;
    const alreadyPrimary = list.find((m) => m.type === "image" && m.isPrimary)?.key ?? null;
    const primaryKey = alreadyPrimary ?? firstImageKey;
    return list.map((m) => ({ ...m, isPrimary: m.type === "image" && m.key === primaryKey }));
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadImage(fd);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (res.error) { onError(res.error); return; }
    if (res.url) {
      onChange(normalizePrimary([...value, { key: crypto.randomUUID(), type: "image", url: res.url, isPrimary: false }]));
    }
  }

  function addVideo() {
    const url = videoUrl.trim();
    if (!url) return;
    if (!isValidVideoUrl(url)) { onError("Pegá un link válido de YouTube o Vimeo."); return; }
    onError(null);
    onChange([...value, { key: crypto.randomUUID(), type: "video", url, isPrimary: false }]);
    setVideoUrl("");
  }

  function remove(key: string) {
    onChange(normalizePrimary(value.filter((m) => m.key !== key)));
  }

  function move(key: string, dir: "left" | "right") {
    const i = value.findIndex((m) => m.key === key);
    const j = dir === "left" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= value.length) return;
    const copy = [...value];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  }

  function setPrimary(key: string) {
    onChange(value.map((m) => ({ ...m, isPrimary: m.type === "image" && m.key === key })));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label style={labelStyle}>Imágenes y videos</label>

      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {value.map((m, i) => {
            const video = m.type === "video" ? parseVideoUrl(m.url) : null;
            const thumb = m.type === "image" ? m.url : video?.thumbnailUrl ?? null;
            return (
              <div key={m.key} style={{
                width: 128, borderRadius: "var(--radius-2)", overflow: "hidden",
                border: `2px solid ${m.isPrimary ? "var(--gt-orange)" : "var(--border-dark)"}`,
                background: "var(--gt-black)",
              }}>
                <div style={{ position: "relative", width: "100%", height: 96, background: "var(--gt-black)" }}>
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                      <Icon.Package size={22} />
                    </div>
                  )}
                  {m.type === "video" && (
                    <span style={badgeStyle("rgba(0,0,0,0.65)")}>▶ VIDEO</span>
                  )}
                  {m.isPrimary && (
                    <span style={{ ...badgeStyle("var(--gt-orange)"), left: "auto", right: 6 }}>PORTADA</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 4px" }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    <IconBtn label="Mover a la izquierda" disabled={disabled || i === 0} onClick={() => move(m.key, "left")}><Icon.ChevronLeft size={14} /></IconBtn>
                    <IconBtn label="Mover a la derecha" disabled={disabled || i === value.length - 1} onClick={() => move(m.key, "right")}><Icon.ChevronRight size={14} /></IconBtn>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    {m.type === "image" && !m.isPrimary && (
                      <IconBtn label="Marcar como portada" disabled={disabled} onClick={() => setPrimary(m.key)}><Icon.Check size={14} /></IconBtn>
                    )}
                    <IconBtn label="Quitar" disabled={disabled} onClick={() => remove(m.key)}><Icon.Trash size={13} /></IconBtn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickFile} style={{ display: "none" }} />
        <Button type="button" variant="ghost" size="sm" disabled={disabled || uploading} onClick={() => fileRef.current?.click()} iconLeft={<Icon.Package size={15} />}>
          {uploading ? "Subiendo…" : "Agregar imagen"}
        </Button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVideo(); } }}
          placeholder="Link de YouTube o Vimeo…"
          disabled={disabled}
          style={{ flex: 1, minWidth: 220, height: 40, background: "var(--gt-charcoal)", color: "var(--text-strong)", border: "1px solid var(--border-dark)", borderRadius: "var(--radius-2)", padding: "0 12px", fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }}
        />
        <Button type="button" variant="ghost" size="sm" disabled={disabled || !videoUrl.trim()} onClick={addVideo}>Agregar video</Button>
      </div>

      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Imágenes JPG/PNG/WebP (hasta 5 MB). La <strong>portada</strong> se ve en el catálogo; el resto va al carrusel de la ficha.
      </span>
    </div>
  );
}

function IconBtn({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28,
        borderRadius: "var(--radius-1)", border: "1px solid var(--border-dark)", background: "transparent",
        color: "var(--text-body)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1,
      }}>
      {children}
    </button>
  );
}

function badgeStyle(bg: string): React.CSSProperties {
  return {
    position: "absolute", top: 6, left: 6, background: bg, color: "#fff",
    borderRadius: "var(--radius-1)", padding: "1px 6px", fontSize: 9.5, fontWeight: 800,
    letterSpacing: ".08em", fontFamily: "var(--font-heading)",
  };
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 700,
  letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-muted)",
};

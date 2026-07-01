"use client";

import React from "react";

/**
 * Banner de éxito efímero. Muestra el mensaje una vez, limpia el `?ok=` de la
 * URL (sin recargar, para que no reaparezca al refrescar) y se oculta solo.
 */
export function FlashBanner({ message }: { message: string | null }) {
  const [msg] = React.useState(message); // capturado al montar
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (!msg) return;
    window.history.replaceState(null, "", window.location.pathname);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg || !visible) return null;

  return (
    <div style={{ color: "#7BD88F", fontSize: 14, background: "rgba(59,165,93,0.12)", border: "1px solid rgba(59,165,93,0.45)", borderRadius: "var(--radius-2)", padding: "12px 14px", marginBottom: 20 }}>
      {msg}
    </div>
  );
}

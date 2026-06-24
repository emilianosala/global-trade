import React from "react";

// Iconos Lucide (line, stroke 2px), inline. Lucide — ISC license.
export type IconProps = { size?: number } & React.SVGProps<SVGSVGElement>;

function svg(children: React.ReactNode, { size = 20, ...rest }: IconProps = {}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Search = (p: IconProps) => svg(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>, p);
export const User = (p: IconProps) => svg(<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>, p);
export const Lock = (p: IconProps) => svg(<><rect x="3" y="11" width="18" height="11" rx="1" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>, p);
export const ArrowRight = (p: IconProps) => svg(<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>, p);
export const X = (p: IconProps) => svg(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>, p);
export const Menu = (p: IconProps) => svg(<path d="M4 12h16M4 6h16M4 18h16" />, p);
export const MapPin = (p: IconProps) => svg(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>, p);
export const Phone = (p: IconProps) => svg(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />, p);
export const Truck = (p: IconProps) => svg(<><path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2" /><path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-2" /><circle cx="7.5" cy="18.5" r="2.5" /><circle cx="17.5" cy="18.5" r="2.5" /></>, p);
export const Shield = (p: IconProps) => svg(<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />, p);
export const ChevronRight = (p: IconProps) => svg(<path d="m9 18 6-6-6-6" />, p);

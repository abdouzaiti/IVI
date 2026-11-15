import * as React from "react";
import { Fabric, type GarmentKind } from "./ClothingRailHero";

interface GarmentThumbnailProps {
  kind: GarmentKind;
  color: string;
  trim: string;
  side?: "front" | "back";
  image?: string;
  backImage?: string;
  alt?: string;
  imageScale?: number;
  imageOffsetY?: number;
}

/**
 * Standalone preview card wrapper that displays supplied garment photography
 * or falls back to the shared SVG Fabric art inside its own isolated <defs> scope.
 */
export function GarmentThumbnail({
  kind,
  color,
  trim,
  side = "front",
  image,
  backImage,
  alt = "",
  imageScale = 1,
  imageOffsetY = 0,
}: GarmentThumbnailProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");

  if (image) {
    const src = side === "back" && backImage ? backImage : image;
    return (
      <div className="relative mx-auto aspect-[200/310] h-full w-auto max-w-full">
        <div
          className="absolute inset-0"
          style={{ transform: "translateY(14%) scale(1.16)", transformOrigin: "50% 0%" }}
        >
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            draggable={false}
            style={{
              top: `${imageOffsetY}%`,
              height: "100%",
              transform: `scale(${imageScale})`,
              transformOrigin: "50% 0%",
            }}
            className="pointer-events-none absolute inset-x-0 w-full select-none object-contain object-top"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-[200/310] h-full w-auto max-w-full">
      <svg aria-hidden="true" width="0" height="0" className="absolute" focusable="false">
        <defs>
          <linearGradient id={`${uid}-volume`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="black" stopOpacity="0.3" />
            <stop offset="0.18" stopColor="black" stopOpacity="0.08" />
            <stop offset="0.45" stopColor="white" stopOpacity="0.06" />
            <stop offset="0.82" stopColor="black" stopOpacity="0.1" />
            <stop offset="1" stopColor="black" stopOpacity="0.32" />
          </linearGradient>
          <linearGradient id={`${uid}-drape`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.14" />
            <stop offset="0.24" stopColor="white" stopOpacity="0" />
            <stop offset="0.78" stopColor="black" stopOpacity="0.04" />
            <stop offset="1" stopColor="black" stopOpacity="0.18" />
          </linearGradient>
          <pattern id={`${uid}-rib`} width="2.6" height="8" patternUnits="userSpaceOnUse">
            <rect width="1.1" height="8" fill="black" fillOpacity="0.2" />
            <rect x="1.3" width="0.7" height="8" fill="white" fillOpacity="0.08" />
          </pattern>
          <pattern id={`${uid}-knit`} width="5" height="4" patternUnits="userSpaceOnUse">
            <path d="M0,0 L2.5,4 L5,0" fill="none" stroke="black" strokeOpacity="0.09" strokeWidth="0.7" />
          </pattern>
          <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.45" />
            </feComponentTransfer>
          </filter>
          <filter id={`${uid}-soft`} x="-20%" y="-5%" width="140%" height="110%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>
      </svg>
      <Fabric uid={uid} kind={kind} side={side} color={color} trim={trim} />
    </div>
  );
}

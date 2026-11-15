import * as React from "react";
import { Fabric, type GarmentKind } from "./ClothingRailHero";

export type GarmentViewMode = "auto" | "front" | "back";

interface GarmentThumbnailProps {
  kind: GarmentKind;
  color: string;
  trim: string;
  side?: "front" | "back";
  viewMode?: GarmentViewMode;
  turnOffsetDeg?: number;
  image?: string;
  backImage?: string;
  sideImage?: string;
  alt?: string;
  imageScale?: number;
  imageOffsetY?: number;
}

function wrap180(deg: number) {
  let d = ((deg % 360) + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Standalone preview card wrapper that smoothly turns through front, side, and back PNGs
 * (or displays supplied/SVG garment art) while keeping visual sizing uniform across items.
 */
export function GarmentThumbnail({
  kind,
  color,
  trim,
  side = "front",
  viewMode,
  turnOffsetDeg = 0,
  image,
  backImage,
  sideImage,
  alt = "",
  imageScale = 1,
  imageOffsetY = 0,
}: GarmentThumbnailProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const frontRef = React.useRef<HTMLDivElement | null>(null);
  const sideLeftRef = React.useRef<HTMLDivElement | null>(null);
  const backRef = React.useRef<HTMLDivElement | null>(null);
  const sideRightRef = React.useRef<HTMLDivElement | null>(null);

  const effectiveMode: GarmentViewMode = viewMode ?? (side === "back" ? "back" : "auto");
  const angleRef = React.useRef<number>(effectiveMode === "back" ? 180 : turnOffsetDeg % 360);
  const modeRef = React.useRef<GarmentViewMode>(effectiveMode);
  modeRef.current = effectiveMode;

  React.useEffect(() => {
    if (!image) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const applyPose = (theta: number) => {
      const hasSide = Boolean(sideImage);
      const front = frontRef.current;
      const sideL = sideLeftRef.current;
      const back = backRef.current;
      const sideR = sideRightRef.current;

      const df = wrap180(theta);
      const db = wrap180(theta - 180);

      if (!hasSide) {
        if (front) {
          const op = Math.abs(df) < 90 ? 1 : 0;
          front.style.opacity = String(op);
          front.style.transform = `perspective(950px) rotateY(${(-df).toFixed(2)}deg)`;
        }
        if (back) {
          const op = Math.abs(db) <= 90 ? 1 : 0;
          back.style.opacity = String(op);
          back.style.transform = `perspective(950px) rotateY(${(-db).toFixed(2)}deg)`;
        }
        return;
      }

      const dsL = wrap180(theta - 90);
      const dsR = wrap180(theta - 270);

      const frontOp = 1 - smoothstep(48, 72, Math.abs(df));
      const backOp = 1 - smoothstep(48, 72, Math.abs(db));
      const sideLOp = 1 - smoothstep(26, 46, Math.abs(dsL));
      const sideROp = 1 - smoothstep(26, 46, Math.abs(dsR));

      const shadeFor = (d: number) =>
        (1 - 0.14 * (1 - Math.abs(Math.cos((d * Math.PI) / 180)))).toFixed(3);

      if (front) {
        front.style.opacity = frontOp.toFixed(3);
        front.style.transform = `perspective(950px) rotateY(${(-df).toFixed(2)}deg)`;
        front.style.filter = `brightness(${shadeFor(df)})`;
      }
      if (sideL) {
        sideL.style.opacity = sideLOp.toFixed(3);
        sideL.style.transform = `perspective(950px) rotateY(${(-dsL).toFixed(2)}deg)`;
        sideL.style.filter = `brightness(${shadeFor(dsL)})`;
      }
      if (back) {
        back.style.opacity = backOp.toFixed(3);
        back.style.transform = `perspective(950px) rotateY(${(-db).toFixed(2)}deg)`;
        back.style.filter = `brightness(${shadeFor(db)})`;
      }
      if (sideR) {
        sideR.style.opacity = sideROp.toFixed(3);
        sideR.style.transform = `perspective(950px) rotateY(${(-dsR).toFixed(2)}deg) scaleX(-1)`;
        sideR.style.filter = `brightness(${shadeFor(dsR)})`;
      }
    };

    if (reducedMotion) {
      applyPose(modeRef.current === "back" ? 180 : 0);
      return;
    }

    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;

      const mode = modeRef.current;
      let theta = angleRef.current;

      if (mode === "auto") {
        const rad = (theta * Math.PI) / 180;
        // Slow gently on front (0°) & back (180°), glide cleanly through side profiles (90° & 270°)
        const speed = 56 * (0.58 + 0.42 * (1 - Math.cos(2 * rad)));
        theta = (theta + speed * dt) % 360;
      } else {
        const target = mode === "back" ? 180 : 0;
        const diff = wrap180(target - theta);
        if (Math.abs(diff) < 0.25) {
          theta = target;
        } else {
          theta = (theta + diff * Math.min(1, dt * 8) + 360) % 360;
        }
      }

      angleRef.current = theta;
      applyPose(theta);
      raf = requestAnimationFrame(tick);
    };

    applyPose(angleRef.current);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [image, backImage, sideImage]);

  if (image) {
    const imgNormStyle: React.CSSProperties = {
      top: `${imageOffsetY}%`,
      height: "100%",
      transform: `scale(${imageScale})`,
      transformOrigin: "50% 0%",
    };
    const backSrc = backImage ?? image;

    return (
      <div className="relative mx-auto aspect-[200/310] h-full w-auto max-w-full">
        <div
          className="absolute inset-0"
          style={{ transform: "translateY(14%) scale(1.16)", transformOrigin: "50% 0%" }}
        >
          <div className="relative h-full w-full" style={{ perspective: "950px" }}>
            <div
              ref={frontRef}
              className="absolute inset-0 z-10 will-change-transform"
              style={{ transformOrigin: "50% 50%" }}
            >
              <img
                src={image}
                alt={alt}
                referrerPolicy="no-referrer"
                draggable={false}
                style={imgNormStyle}
                className="pointer-events-none absolute inset-x-0 w-full select-none object-contain object-top"
              />
            </div>

            {sideImage && (
              <div
                ref={sideLeftRef}
                className="absolute inset-0 z-20 will-change-transform"
                style={{ transformOrigin: "50% 50%", opacity: 0 }}
              >
                <img
                  src={sideImage}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  style={imgNormStyle}
                  className="pointer-events-none absolute inset-x-0 w-full select-none object-contain object-top"
                />
              </div>
            )}

            <div
              ref={backRef}
              className="absolute inset-0 z-10 will-change-transform"
              style={{ transformOrigin: "50% 50%", opacity: 0 }}
            >
              <img
                src={backSrc}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                draggable={false}
                style={imgNormStyle}
                className="pointer-events-none absolute inset-x-0 w-full select-none object-contain object-top"
              />
            </div>

            {sideImage && (
              <div
                ref={sideRightRef}
                className="absolute inset-0 z-20 will-change-transform"
                style={{ transformOrigin: "50% 50%", opacity: 0 }}
              >
                <img
                  src={sideImage}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  style={imgNormStyle}
                  className="pointer-events-none absolute inset-x-0 w-full select-none object-contain object-top"
                />
              </div>
            )}
          </div>
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

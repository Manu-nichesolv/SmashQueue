import type { CSSProperties } from "react";

export function motionStyle(delaySeconds: number): CSSProperties {
  return {
    "--animate-duration": "0.45s",
    "--animate-delay": `${delaySeconds}s`,
  } as CSSProperties;
}

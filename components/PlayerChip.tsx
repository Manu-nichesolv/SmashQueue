import { motionStyle } from "./motion";

export function PlayerChip({
  index,
  name,
  delay,
  bench = false,
}: {
  index: number;
  name: string;
  delay: number;
  bench?: boolean;
}) {
  return (
    <span
      className={`chip animate__animated ${bench ? "bench animate__fadeIn" : "animate__fadeInUp"}`}
      style={motionStyle(delay)}
    >
      <span className="num">{index + 1}</span>
      {name}
    </span>
  );
}

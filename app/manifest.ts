import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmashQueue",
    short_name: "SmashQueue",
    description: "Fair badminton rotations for the court you booked.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ee",
    theme_color: "#1f7a4d",
  };
}

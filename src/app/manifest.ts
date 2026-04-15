import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PantryPal",
    short_name: "PantryPal",
    description: "Simple AI meal ideas from the ingredients you already have.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ee",
    theme_color: "#172126",
    icons: []
  };
}

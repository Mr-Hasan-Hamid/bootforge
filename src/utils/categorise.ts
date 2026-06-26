export const categorise = (name: string): string => {
  const n = name.toLowerCase();
  if (
    n.includes("goku") || n.includes("sharingan") || n.includes("anime") ||
    n.includes("sakura") || n.includes("zenitsu") || n.includes("demon slayer") ||
    n.includes("makima") || n.includes("naruto") || n.includes("tanjiro") ||
    n.includes("mahoraga") || n.includes("chainsaw man") || n.includes("reze") ||
    n.includes("arlecchino") || n.includes("sakamoto days") || n.includes("osaragi") ||
    n.includes("soul eater") || n.includes("deadpool") || n.includes("devil eye")
  )
    return "Anime";
  if (n.includes("google") || n.includes("pixel")) return "Google";
  if (
    n.includes("rog") || n.includes("alienware") || n.includes("apple") ||
    n.includes("samsung") || n.includes("xbox") || n.includes("playstation") ||
    n.includes("psx") || n.includes("overwatch") || n.includes("ibm") ||
    n.includes("zelda") || n.includes("watch dogs") || n.includes("darth")
  )
    return "Brand & Gaming";
  if (
    n.includes("hud") || n.includes("circuit") || n.includes("digital") ||
    n.includes("glitch") || n.includes("tech") || n.includes("alien") ||
    n.includes("cyber") || n.includes("matrix")
  )
    return "Sci-Fi & Tech";
  if (
    n.includes("load") || n.includes("dots") || n.includes("line") ||
    n.includes("point") || n.includes("bubble") || n.includes("preloader")
  )
    return "Minimalist";
  return "Abstract";
};

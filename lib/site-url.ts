const productionUrl = "https://learntlicho.ca";

export const getMetadataBase = (
  configuredUrl: string | undefined,
  production = process.env.NODE_ENV === "production"
) => {
  const fallback = production ? productionUrl : "http://localhost:3000";
  try {
    const url = new URL(configuredUrl?.trim() || fallback);
    if (!["http:", "https:"].includes(url.protocol)) return new URL(fallback);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (production && (loopback || url.protocol !== "https:"))
      return new URL(productionUrl);
    return new URL(url.origin);
  } catch {
    return new URL(fallback);
  }
};

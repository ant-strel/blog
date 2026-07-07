function resolveApiBaseUrl(envValue: string | undefined, fallback: string): string {
  if (envValue && envValue.trim().length > 0) {
    return envValue;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return fallback;
}

function resolveAppUrl(envValue: string | undefined, fallback: string): string {
  const value = envValue && envValue.trim().length > 0 ? envValue : fallback;
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export { resolveApiBaseUrl, resolveAppUrl };

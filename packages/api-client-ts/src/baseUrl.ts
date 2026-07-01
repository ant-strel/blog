function resolveApiBaseUrl(envValue: string | undefined, fallback: string): string {
  if (envValue && envValue.trim().length > 0) {
    return envValue;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return fallback;
}

export { resolveApiBaseUrl };

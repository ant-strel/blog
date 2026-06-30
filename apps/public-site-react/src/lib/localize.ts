import type { LocalizedText } from "@template/contracts";

export function localize(input: string | LocalizedText, locale: "en" | "ru"): string {
  if (typeof input === "string") {
    return input;
  }

  return input[locale] ?? input.en ?? input.ru ?? "";
}

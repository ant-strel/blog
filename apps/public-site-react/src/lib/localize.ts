import type { LocaleCode, LocalizedText } from "@template/contracts";

export function localize(input: string | LocalizedText, locale: LocaleCode): string {
  if (typeof input === "string") {
    return input;
  }

  return input[locale] ?? input.en ?? input.ru ?? input.es ?? "";
}

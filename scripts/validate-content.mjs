import { readFile } from "node:fs/promises";
import { validateSnapshot } from "./publication-schema.mjs";

const snapshot = validateSnapshot(JSON.parse(await readFile(new URL("../content/published.json", import.meta.url), "utf8")));
console.log("Validated public articles:", snapshot.articles.length);

import { TradeType } from "@/types";

/** Starter suggestions only — any free-text trade is valid everywhere. */
export const DEFAULT_TRADES: TradeType[] = [
  "CNC Machining",
  "3D Printing",
  "Laser Cutting",
  "CAD Design",
  "Industrial Fabrication",
];

/**
 * Merge default trades with every trade already used in the CRM so suggestions
 * grow with the business. De-duplicates case-insensitively, keeps first spelling.
 */
export function collectTrades(...sources: (TradeType | undefined | null)[][]): TradeType[] {
  const seen = new Map<string, TradeType>();
  for (const list of [DEFAULT_TRADES, ...sources]) {
    for (const raw of list) {
      const name = (raw || "").trim();
      // "Custom Domain" was a placeholder bucket in the old builder, not a real service
      if (!name || name === "Custom Domain") continue;
      const key = name.toLowerCase();
      if (!seen.has(key)) seen.set(key, name);
    }
  }
  return Array.from(seen.values());
}

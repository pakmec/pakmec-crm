"use client";

import React from "react";

interface CurrencyDisplayProps {
  amount: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "default" | "orange" | "amber" | "green" | "emerald" | "red" | "muted";
  className?: string;
  prefixColor?: string;
  numberColor?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  size = "md",
  color = "default",
  className = "",
  prefixColor = "text-slate-600 dark:text-zinc-300 font-semibold",
  numberColor,
}) => {
  const colorMap: Record<string, string> = {
    default: "text-slate-900 dark:text-zinc-100",
    orange: "text-[#fe7518]",
    amber: "text-amber-800 dark:text-amber-300",
    green: "text-emerald-700 dark:text-emerald-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    red: "text-rose-700 dark:text-rose-400",
    muted: "text-slate-600 dark:text-zinc-300",
  };

  const resolvedNumberColor = numberColor || colorMap[color] || colorMap.default;
  const formattedNum = Math.abs(amount).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? "-" : "";

  const sizeClasses = {
    xs: { prefix: "text-[9px] tracking-wider", num: "text-[11px] font-medium" },
    sm: { prefix: "text-[10px] tracking-wider", num: "text-xs font-semibold" },
    md: { prefix: "text-[11px] tracking-wider", num: "text-sm font-semibold" },
    lg: { prefix: "text-xs tracking-wider", num: "text-base font-bold" },
    xl: { prefix: "text-xs tracking-wider font-mono", num: "text-xl font-bold tracking-tight" },
  };

  const current = sizeClasses[size];

  return (
    <span className={`inline-flex items-baseline gap-1 font-mono tabular-nums leading-none ${className}`}>
      {sign && <span className="font-semibold text-rose-500 mr-0.5">{sign}</span>}
      <span className={`${current.prefix} uppercase select-none font-medium ${prefixColor}`}>
        PKR
      </span>
      <span className={`${current.num} ${resolvedNumberColor}`}>
        {formattedNum}
      </span>
    </span>
  );
};

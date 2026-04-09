"use client";

import { motion } from "framer-motion";
import { Check, X, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SurfPackage } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompareRow {
  key: string;
  label: string;
  getValue: (pkg: SurfPackage) => string | boolean | number;
}

interface PackagesComparisonTableProps {
  packages: SurfPackage[];
  labels: {
    compareTitle: string;
    compareNights: string;
    compareLessons: string;
    compareRoom: string;
    compareMeals: string;
    compareTransfers: string;
    compareYoga: string;
    compareTours: string;
    compareBoard: string;
    comparePhotos: string;
    compareYes: string;
    compareNo: string;
    compareMostPopular: string;
    dorm: string;
    private: string;
    family: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEAL_PATTERNS = /meal|breakfast|lunch|dinner|food|comida|desayuno|almuerzo|cena/i;
const TRANSFER_PATTERNS = /transfer|pickup|traslado|recogida|airport/i;
const YOGA_PATTERNS = /yoga/i;
const TOUR_PATTERNS = /tour/i;
const BOARD_PATTERNS = /board|tabla/i;
const PHOTO_PATTERNS = /photo|foto/i;

function includesFeature(includes: string[], pattern: RegExp): boolean {
  return includes.some((item) => pattern.test(item));
}

// ─── Cell component ───────────────────────────────────────────────────────────

function BoolCell({ value, yes, no }: { value: boolean; yes: string; no: string }) {
  if (value) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium text-sm">
        <Check className="w-4 h-4 flex-shrink-0" />
        {yes}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
      <X className="w-4 h-4 flex-shrink-0" />
      {no}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PackagesComparisonTable({ packages, labels }: PackagesComparisonTableProps) {
  if (packages.length === 0) return null;

  const roomTypeLabels: Record<string, string> = {
    dorm: labels.dorm,
    private: labels.private,
    family: labels.family,
  };

  const rows: CompareRow[] = [
    {
      key: "nights",
      label: labels.compareNights,
      getValue: (pkg) => pkg.nights,
    },
    {
      key: "lessons",
      label: labels.compareLessons,
      getValue: (pkg) => pkg.surf_lessons,
    },
    {
      key: "room",
      label: labels.compareRoom,
      getValue: (pkg) => roomTypeLabels[pkg.room_type] ?? pkg.room_type,
    },
    {
      key: "meals",
      label: labels.compareMeals,
      getValue: (pkg) => includesFeature(pkg.includes, MEAL_PATTERNS),
    },
    {
      key: "transfers",
      label: labels.compareTransfers,
      getValue: (pkg) => includesFeature(pkg.includes, TRANSFER_PATTERNS),
    },
    {
      key: "yoga",
      label: labels.compareYoga,
      getValue: (pkg) => includesFeature(pkg.includes, YOGA_PATTERNS),
    },
    {
      key: "tours",
      label: labels.compareTours,
      getValue: (pkg) => includesFeature(pkg.includes, TOUR_PATTERNS),
    },
    {
      key: "board",
      label: labels.compareBoard,
      getValue: (pkg) => includesFeature(pkg.includes, BOARD_PATTERNS),
    },
    {
      key: "photos",
      label: labels.comparePhotos,
      getValue: (pkg) => includesFeature(pkg.includes, PHOTO_PATTERNS),
    },
  ];

  return (
    <motion.section
      className="py-20 bg-background"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">
            {labels.compareTitle}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-2">
            {labels.compareTitle}
          </h2>
        </div>

        {/* ── Desktop Table ── */}
        <div className="hidden md:block max-w-5xl mx-auto overflow-x-auto rounded-2xl border border-border shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                {/* Feature label col */}
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground w-48 border-b border-border">
                  &nbsp;
                </th>
                {packages.map((pkg) => (
                  <th
                    key={pkg.id}
                    className={`px-5 py-4 text-center border-b border-border ${
                      pkg.is_popular
                        ? "bg-primary/8 border-x-2 border-x-primary/30"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {pkg.is_popular && (
                        <Badge className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full border-0 gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          {labels.compareMostPopular}
                        </Badge>
                      )}
                      <span className="font-heading font-bold text-base text-foreground">
                        {pkg.name}
                      </span>
                      <span className="font-bold text-primary text-xl font-heading">
                        ${pkg.price}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={row.key}
                  className={`transition-colors ${
                    rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  <td className="px-6 py-3.5 text-sm font-medium text-foreground border-r border-border">
                    {row.label}
                  </td>
                  {packages.map((pkg) => {
                    const value = row.getValue(pkg);
                    return (
                      <td
                        key={pkg.id}
                        className={`px-5 py-3.5 text-center ${
                          pkg.is_popular
                            ? "bg-primary/5 border-x-2 border-x-primary/20"
                            : ""
                        }`}
                      >
                        {typeof value === "boolean" ? (
                          <div className="flex justify-center">
                            <BoolCell value={value} yes={labels.compareYes} no={labels.compareNo} />
                          </div>
                        ) : (
                          <span className="text-sm text-foreground font-medium">
                            {value}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile: Horizontal scroll cards ── */}
        <div className="md:hidden">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: "none" }}
          >
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`flex-shrink-0 snap-center w-[75vw] max-w-xs rounded-2xl border overflow-hidden bg-card ${
                  pkg.is_popular
                    ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                    : "border-border"
                }`}
              >
                {/* Card header */}
                <div
                  className={`px-5 py-4 ${
                    pkg.is_popular ? "bg-primary/8" : "bg-muted/30"
                  }`}
                >
                  {pkg.is_popular && (
                    <Badge className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full border-0 gap-1 mb-2">
                      <Star className="w-3 h-3 fill-white" />
                      {labels.compareMostPopular}
                    </Badge>
                  )}
                  <p className="font-heading font-bold text-base text-foreground">
                    {pkg.name}
                  </p>
                  <p className="font-bold text-primary text-xl font-heading mt-0.5">
                    ${pkg.price}
                  </p>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border">
                  {rows.map((row) => {
                    const value = row.getValue(pkg);
                    return (
                      <div key={row.key} className="flex items-center justify-between px-5 py-3">
                        <span className="text-xs text-muted-foreground">{row.label}</span>
                        <div className="text-right">
                          {typeof value === "boolean" ? (
                            <BoolCell value={value} yes={labels.compareYes} no={labels.compareNo} />
                          ) : (
                            <span className="text-sm font-medium text-foreground">{value}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* Scroll hint */}
          <p className="text-center text-xs text-muted-foreground mt-2">
            ← Deslizá para comparar →
          </p>
        </div>
      </div>
    </motion.section>
  );
}

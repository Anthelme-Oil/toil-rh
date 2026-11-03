"use client";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type {
  DocumentCategory,
  DocumentFormat,
  MediaDocumentFilters,
  MediaDocumentSort,
} from "@/types";
interface MediaFiltersProps {
  filters: MediaDocumentFilters;
  sort: MediaDocumentSort;
  onFiltersChange: (filters: MediaDocumentFilters) => void;
  onSortChange: (sort: MediaDocumentSort) => void;
}
export default function MediaFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
}: MediaFiltersProps) {
  const updateFilter = <K extends keyof MediaDocumentFilters>(
    key: K,
    value: MediaDocumentFilters[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };
  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.format) ||
    Boolean(filters.tag);
  const resetFilters = () => {
    onFiltersChange({});
    onSortChange("LATEST");
  };
  return (
    <div className="mb-6 space-y-3">
      {" "}
      {/* Recherche */}{" "}
      <div className="flex flex-col gap-3 lg:flex-row">
        {" "}
        <div className="relative flex-1">
          {" "}
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />{" "}
          <input
            type="search"
            value={filters.search ?? ""}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Rechercher un document..."
            className=" h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f4c5c] focus:ring-2 focus:ring-[#0f4c5c]/10 "
          />{" "}
          {filters.search && (
            <button
              type="button"
              onClick={() => updateFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Effacer la recherche"
            >
              {" "}
              <X size={16} />{" "}
            </button>
          )}{" "}
        </div>{" "}
        <div className="flex items-center gap-2">
          {" "}
          <div className="relative">
            {" "}
            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />{" "}
            <select
              value={filters.format ?? ""}
              onChange={(event) =>
                updateFilter(
                  "format",
                  event.target.value
                    ? (event.target.value as DocumentFormat)
                    : undefined,
                )
              }
              className=" h-11 min-w-[150px] appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none focus:border-[#0f4c5c] focus:ring-2 focus:ring-[#0f4c5c]/10 "
            >
              {" "}
              <option value="">Tous les formats</option>{" "}
              <option value="PDF">PDF</option> <option value="DOC">DOC</option>{" "}
              <option value="DOCX">DOCX</option>{" "}
              <option value="XLS">XLS</option>{" "}
              <option value="XLSX">XLSX</option>{" "}
              <option value="PPT">PPT</option>{" "}
              <option value="PPTX">PPTX</option>{" "}
              <option value="IMAGE">Image</option>{" "}
              <option value="VIDEO">Vidéo</option>{" "}
            </select>{" "}
          </div>{" "}
          <div className="relative">
            {" "}
            <CalendarDays
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />{" "}
            <select
              value={sort}
              onChange={(event) =>
                onSortChange(event.target.value as MediaDocumentSort)
              }
              className=" h-11 min-w-[180px] appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none focus:border-[#0f4c5c] focus:ring-2 focus:ring-[#0f4c5c]/10 "
            >
              {" "}
              <option value="LATEST"> Plus récent </option>{" "}
              <option value="OLDEST"> Plus ancien </option>{" "}
              <option value="MOST_VIEWED"> Plus consulté </option>{" "}
              <option value="MOST_DOWNLOADED"> Plus téléchargé </option>{" "}
              <option value="TITLE_ASC"> A → Z </option>{" "}
              <option value="TITLE_DESC"> Z → A </option>{" "}
            </select>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Catégorie */}{" "}
      <div className="flex flex-wrap items-center gap-2">
        {" "}
        <Filter size={15} className="text-slate-400" />{" "}
        <select
          value={filters.category ?? ""}
          onChange={(event) =>
            updateFilter(
              "category",
              event.target.value
                ? (event.target.value as DocumentCategory)
                : undefined,
            )
          }
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-[#0f4c5c]"
        >
          {" "}
          <option value=""> Toutes les catégories </option>{" "}
          <option value="PROCEDURE">Procédure</option>{" "}
          <option value="GUIDE">Guide</option>{" "}
          <option value="FORMULAIRE">Formulaire</option>{" "}
          <option value="POLITIQUE">Politique</option>{" "}
          <option value="NOTE">Note</option>{" "}
          <option value="RAPPORT">Rapport</option>{" "}
          <option value="MANUEL">Manuel</option>{" "}
          <option value="INSTRUCTION">Instruction</option>{" "}
          <option value="REGLEMENT">Règlement</option>{" "}
          <option value="PRESENTATION">Présentation</option>{" "}
          <option value="MODELE">Modèle</option>{" "}
          <option value="REFERENCE">Référence</option>{" "}
        </select>{" "}
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#0f4c5c] transition hover:bg-[#0f4c5c]/5"
          >
            {" "}
            <X size={14} /> Réinitialiser{" "}
          </button>
        )}{" "}
      </div>{" "}
    </div>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import type {
  DocumentDepartment,
  MediaDocument,
  MediaDocumentFilters,
  MediaDocumentSort,
} from "@/types";
import MediaHeader from "./MediaHeader";
import MediaDepartmentTabs from "./MediaDepartmentTabs";
import MediaFilters from "./MediaFilters";
import MediaGrid from "./MediaGrid";
import MediaEmptyState from "./MediaEmptyState";
import MediaPagination from "./MediaPagination";
interface MediaLibraryProps {
  documents: MediaDocument[];
  pageSize?: number;
}
export default function MediaLibrary({
  documents,
  pageSize = 9,
}: MediaLibraryProps) {
  const [department, setDepartment] = useState<DocumentDepartment | "ALL">(
    "ALL",
  );
  const [filters, setFilters] = useState<MediaDocumentFilters>({});
  const [sort, setSort] = useState<MediaDocumentSort>("LATEST");
  const [page, setPage] = useState(1);
  /** * Filtrage + recherche + tri. */ const filteredDocuments = useMemo(() => {
    let result = [...documents];
    if (department !== "ALL") {
      result = result.filter((document) => document.department === department);
    }
    if (filters.search?.trim()) {
      const search = filters.search.trim().toLowerCase();
      result = result.filter((document) => {
        const content = [
          document.title,
          document.description,
          document.objective,
          document.department,
          document.category,
          document.fileName,
          ...(document.tags ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return content.includes(search);
      });
    }
    if (filters.category) {
      result = result.filter(
        (document) => document.category === filters.category,
      );
    }
    if (filters.format) {
      result = result.filter((document) => document.format === filters.format);
    }
    if (filters.tag) {
      const tag = filters.tag.toLowerCase();
      result = result.filter((document) =>
        document.tags?.some((item) => item.toLowerCase() === tag),
      );
    }
    switch (sort) {
      case "LATEST":
        result.sort(
          (a, b) =>
            new Date(b.publishedAt ?? b.createdAt).getTime() -
            new Date(a.publishedAt ?? a.createdAt).getTime(),
        );
        break;
      case "OLDEST":
        result.sort(
          (a, b) =>
            new Date(a.publishedAt ?? a.createdAt).getTime() -
            new Date(b.publishedAt ?? b.createdAt).getTime(),
        );
        break;
      case "MOST_VIEWED":
        result.sort((a, b) => b.views - a.views);
        break;
      case "MOST_DOWNLOADED":
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case "TITLE_ASC":
        result.sort((a, b) => a.title.localeCompare(b.title, "fr"));
        break;
      case "TITLE_DESC":
        result.sort((a, b) => b.title.localeCompare(a.title, "fr"));
        break;
    }
    return result;
  }, [documents, department, filters, sort]);
  /** * Retour à la première page * lorsqu'un filtre change. */ useEffect(() => {
    setPage(1);
  }, [department, filters, sort]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / pageSize),
  );
  const paginatedDocuments = filteredDocuments.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  return (
    <section className="w-full">
      {" "}
      <MediaHeader totalDocuments={filteredDocuments.length} />{" "}
      <MediaDepartmentTabs value={department} onChange={setDepartment} />{" "}
      <MediaFilters
        filters={filters}
        sort={sort}
        onFiltersChange={setFilters}
        onSortChange={setSort}
      />{" "}
      {paginatedDocuments.length > 0 ? (
        <>
          {" "}
          <MediaGrid documents={paginatedDocuments} />{" "}
          <MediaPagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />{" "}
        </>
      ) : (
        <MediaEmptyState
          search={
            Boolean(filters.search) ||
            Boolean(filters.category) ||
            Boolean(filters.format) ||
            department !== "ALL"
          }
        />
      )}{" "}
    </section>
  );
}

import { FileSearch, Library } from "lucide-react";
interface MediaEmptyStateProps {
  search?: boolean;
}
export default function MediaEmptyState({
  search = false,
}: MediaEmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center">
      {" "}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {" "}
        {search ? <FileSearch size={26} /> : <Library size={26} />}{" "}
      </div>{" "}
      <h3 className="mt-4 text-sm font-semibold text-slate-800">
        {" "}
        {search ? "Aucun document trouvé" : "Aucun document disponible"}{" "}
      </h3>{" "}
      <p className="mt-1 max-w-md text-sm text-slate-500">
        {" "}
        {search
          ? "Aucun document ne correspond aux critères de recherche sélectionnés."
          : "Les documents disponibles pour cette section apparaîtront ici."}{" "}
      </p>{" "}
    </div>
  );
}

import React, { useState } from "react";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  headerClassName?: string; // Classe spécifique pour l'en-tête (<th>)
  cellClassName?: string;   // Classe spécifique pour les cellules (<td>)
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsOptions?: number[];
  hasSearch?: boolean; // Nouvelle prop pour activer/désactiver la barre de recherche
}

export default function DataTable<T>({ 
  data = [], 
  columns = [], 
  itemsOptions = [5, 10, 20, 50],
  hasSearch = false // Par défaut à false
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(itemsOptions[0] || 10);
  const [searchQuery, setSearchQuery] = useState<string>(""); // État pour la recherche

  // Logique de filtrage sur toutes les clés de l'objet
  const filteredData = data.filter((row) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(row as Record<string, unknown>).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(query);
    });
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const handleRowsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Retour à la première page lors d'une recherche
  };

  return (
    <div className="w-full bg-white rounded-0 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100">
      
      {/* Barre de recherche conditionnelle */}
      {hasSearch && (
        <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`py-4 px-6 ${col.headerClassName || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-600 text-sm">
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-gray-50/60 transition-colors duration-150"
                >
                  {columns.map((col, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`py-4 px-6 ${col.cellClassName || ""}`}
                    >
                      {col.render 
                        ? col.render(row) 
                        : col.accessor 
                          ? (row[col.accessor] as React.ReactNode) 
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                  Aucune donnée disponible
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Barre de pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-100 gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Afficher</span>
          <select 
            value={rowsPerPage} 
            onChange={handleRowsChange}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            {itemsOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span>par page</span>
        </div>

        <div className="text-xs sm:text-sm">
          Affichage de <span className="font-medium text-gray-700">{filteredData.length ? indexOfFirstRow + 1 : 0}</span> à <span className="font-medium text-gray-700">{Math.min(indexOfLastRow, filteredData.length)}</span> sur <span className="font-medium text-gray-700">{filteredData.length}</span> résultats {filteredData.length !== data.length && `(filtrés sur ${data.length} au total)`}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-xs"
          >
            Précédent
          </button>
          
          <span className="px-3 py-1.5 text-xs font-medium text-gray-700">
            Page {currentPage} sur {totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-xs"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
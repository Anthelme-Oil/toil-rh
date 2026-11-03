import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white py-3.5 px-6 text-xs text-gray-500">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p>© {new Date().getFullYear()} Intranet Entreprise — Tous droits réservés.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-blue-600 transition-colors">Support IT</a>
          <span className="text-gray-300">•</span>
          <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
        </div>
      </div>
    </footer>
  );
};

'use client';

import type { DocumentDepartment } from '@/types';
import { DOCUMENT_DEPARTMENTS } from '@/types';

interface MediaDepartmentTabsProps {
  value: DocumentDepartment | 'ALL';
  onChange: (value: DocumentDepartment | 'ALL') => void;
}

export default function MediaDepartmentTabs({
  value,
  onChange,
}: MediaDepartmentTabsProps) {
  const departments: Array<DocumentDepartment | 'ALL'> = [
    'ALL',
    ...DOCUMENT_DEPARTMENTS,
  ];

  return (
    <div className="mb-5 overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">

        {departments.map((department) => {
          const active = value === department;

          return (
            <button
              key={department}
              type="button"
              onClick={() => onChange(department)}
              className={`
                rounded-lg px-4 py-2 text-sm font-medium
                transition-all duration-200
                ${
                  active
                    ? 'bg-[#0f4c5c] text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }
              `}
            >
              {department === 'ALL' ? 'Tous' : department}
            </button>
          );
        })}

      </div>
    </div>
  );
}


'use client';

import {
  CheckCircle2,
  Clock3,
  ListFilter,
  LucideIcon,
  Ban,
} from 'lucide-react';
import { FilterKey } from '@/types';


interface RequestFiltersProps {
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
}

interface Filter {
  key: FilterKey;
  label: string;
  icon: LucideIcon;
  color: 'amber' | 'green' | 'blue' | 'red';
}

const filters: Filter[] = [
  {
    key: 'pending',
    label: 'Demandes non validées',
    icon: Clock3,
    color: 'amber',
  },
  {
    key: 'validated',
    label: 'Demandes validées',
    icon: CheckCircle2,
    color: 'green',
  },
   {
    key: 'refused',
    label: 'Demandes rejetées',
    icon: Ban,
    color: 'red',
  },
  {
    key: 'all',
    label: 'Toutes les demandes',
    icon: ListFilter,
    color: 'blue',
  },
];

export default function RequestFilters({
  activeFilter,
  onFilterChange,
}: RequestFiltersProps) {
  return (
    <div className="w-full rounded-[2px] border-0 border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex w-full items-center gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;

          const colorClasses = {
            amber: {
              active:
                'bg-amber-50 text-amber-700 border-amber-200',
              icon: 'text-amber-600',
            },
            green: {
              active:
                'bg-green-50 text-green-700 border-green-200',
              icon: 'text-green-600',
            },
            blue: {
              active:
                'bg-blue-50 text-blue-700 border-blue-200',
              icon: 'text-blue-600',
            },
             red: {
              active:
                'bg-red-50 text-red-700 border-red-200',
              icon: 'text-red-600',
            },
          };

          const colors = colorClasses[filter.color];

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => onFilterChange(filter.key)}
              className={`
                flex flex-1 items-center justify-center gap-2
                rounded-lg border px-4 py-3
                text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? colors.active
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }
              `}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? colors.icon : ''}
              />

              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
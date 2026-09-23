import type { WorkflowStatus } from "@/lib/workflows/engine";

interface StatutColorProps {
  color: string;
}

export  function getStatutColor(statut:string): string {
  switch (statut) {
    case "SUBMITTED":
      return "bg-slate-50 text-slate-600 border-slate-200";

    case "PENDING_N1":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "PENDING_DRH":
      return "bg-violet-50 text-violet-700 border-violet-200";

    case "PENDING_RH_EXEC":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "PENDING_IT_MGR":
      return "bg-sky-50 text-sky-700 border-sky-200";

    case "PENDING_IT_EXEC":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";

    case "APPROUVE":
      return "bg-green-50 text-green-700 border-green-200";

    case "REFUSE":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export function getStatutText(statut:string):string{
  switch(statut){
    case "APPROUVE":
      return "Demande approuvée";
    case "REFUSE":
      return "Demande refusée";
     default :
     return "Demande en cours";   
  }
}
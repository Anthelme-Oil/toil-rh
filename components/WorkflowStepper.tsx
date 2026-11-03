"use client";

import React from "react";
import { Check, Clock, X, AlertCircle, MessageSquare } from "lucide-react";

export type StepStatus = "COMPLETED" | "IN_PROGRESS" | "REJECTED" | "PENDING";

export interface WorkflowStep {
  id: string;
  nom: string;
  role: string;
  valideur?: string;
  statut: StepStatus;
  dateValidation?: string;
  commentaire?: string;
}

interface WorkflowStepperProps {
  steps: WorkflowStep[];
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ steps }) => {
  return (
    <div className="w-full py-2">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.statut === "COMPLETED";
          const isInProgress = step.statut === "IN_PROGRESS";
          const isRejected = step.statut === "REJECTED";

          return (
            <div key={step.id} className="flex-1 flex md:flex-col relative w-full md:w-auto mb-6 md:mb-0 group">
              {/* Ligne de connexion */}
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 -bottom-8 w-0.5 md:hidden transition-colors ${
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
              {!isLast && (
                <div
                  className={`hidden md:block absolute top-4 left-[50%] right-[-50%] h-0.5 z-0 transition-colors ${
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}

              {/* Indicateur visuel (Pastille) */}
              <div className="flex items-center md:flex-col md:justify-center z-10 mr-4 md:mr-0 shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shadow-sm transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                      : isInProgress
                      ? "bg-amber-500 text-white ring-4 ring-amber-50 animate-pulse"
                      : isRejected
                      ? "bg-rose-600 text-white ring-4 ring-rose-50"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isInProgress ? (
                    <Clock className="w-4 h-4" />
                  ) : isRejected ? (
                    <X className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
              </div>

              {/* Contenu textuel */}
              <div className="flex-1 md:text-center md:mt-3 md:px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {step.role}
                </span>
                <h4 className="text-xs font-semibold text-slate-800 mt-0.5">
                  {step.nom}
                </h4>

                {step.valideur && (
                  <p className="text-[11px] text-slate-600 font-medium mt-1">
                    {step.valideur}
                  </p>
                )}

                {step.dateValidation && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {step.dateValidation}
                  </p>
                )}

                {step.commentaire && (
                  <div className="mt-2 text-[11px] bg-slate-50 border border-slate-200/60 rounded p-2 text-slate-600 text-left">
                    <span className="italic block">"{step.commentaire}"</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
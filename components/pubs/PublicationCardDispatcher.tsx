"use client";

import { PublicationType } from "@/types";
import { ActualiteCard } from "./cards/ActualiteCard";
import { VideoCard } from "./cards/VideoCard";
import { AnnonceCard } from "./cards/AnnonceCard";
import { EvenementCard } from "./cards/EvenementCard";

interface Props {
  type: PublicationType;
  data: any;
}

export function PublicationCardDispatcher({ type, data }: Props) {
  switch (type) {
    case "actualites":
      return (
        <div className="flex h-full w-full flex-col rounded-sm  border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
          <ActualiteCard data={data} />
        </div>
      );
    case "videos":
      return (
        <div className="flex h-full w-full flex-col rounded-sm  border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
          <VideoCard data={data} />
        </div>
      );

    case "annonces":
      return (
        <div className="flex h-full w-full flex-col rounded-sm  border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
          <AnnonceCard data={data} />
        </div>
      );
    case "evenements":
      return (
        <div className="flex h-full w-full flex-col rounded-sm  border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
          <EvenementCard data={data} />;
        </div>
      );

    default:
      return null;
  }
}

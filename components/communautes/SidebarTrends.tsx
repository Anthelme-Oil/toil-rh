import { ChevronRight, Flame, Heart } from "lucide-react";
import { Channel } from "@/lib/communautes/types";

interface SidebarTrendsProps {
  activeChannel: Channel;
  trends: { name: string; posts: string }[];
}

export default function SidebarTrends({ activeChannel, trends }: SidebarTrendsProps) {
  return (
    <aside className="hidden w-[360px] shrink-0 xl:block">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[13px] font-extrabold text-[#26324c]">
          Tendances {activeChannel !== "Accueil" && `— ${activeChannel}`}
        </h2>
        <Flame className="h-4 w-4 text-[#e96556]" />
      </div>

      <div className="space-y-2">
        {trends.map((trend, index) => (
          <button
            key={trend.name}
            className="group flex w-full items-center gap-3 rounded-xl border border-[#e8ebf2] bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-[12px] font-extrabold text-[#c3c9d5]">0{index + 1}</span>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-[#46526b] group-hover:text-[#3159ae]">
                {trend.name}
              </p>
              <p className="mt-1 text-[10px] text-[#99a2b4]">{trend.posts}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[#b3bbca]" />
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-[#fff4ee] p-4">
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#e96556] shadow-sm">
          <Heart className="h-4 w-4 fill-current" />
        </div>
        <p className="text-[13px] font-extrabold text-[#4c3440]">Fais vivre la communauté</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#9a6f72]">
          Un commentaire, un bravo ou une idée peut faire toute la différence.
        </p>
      </div>
    </aside>
  );
}
import { Hash, Settings2, ShieldCheck, Users } from "lucide-react";
import { CHANNELS } from "@/lib/communautes/data";
import { Channel, CommunityEntity ,EntityWithGreffe} from "@/lib/communautes/types";

interface SidebarChannelsProps {
  activeChannel: Channel;
  data?:EntityWithGreffe<CommunityEntity>[]
  setActiveChannel: (channel: Channel) => void;
}



export default function SidebarChannels({
  activeChannel,
  setActiveChannel,
  data
}: SidebarChannelsProps) {

const channelCounts = (data ?? []).reduce<Record<string, number>>(
  (acc, item) => {
    acc[item.typeRefer] = (acc[item.typeRefer] ?? 0) + 1;
    return acc;
  },
  {}
);

const mappedChannels = CHANNELS.map((chan) => ({
  ...chan,
  count: chan.key ? channelCounts[chan.key] ?? 0 : undefined,
}));

  
  return (
    <aside className="hidden w-[315px] shrink-0 lg:block">
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a5adbf]">
        Salons
      </p>
      <nav className="space-y-1">
        {mappedChannels.map(({ label, icon: Icon, count }) => (
          <button
            key={label}
            onClick={() => setActiveChannel(label)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition ${
              activeChannel === label
                ? "bg-[#e9efff] text-[#3159ae]"
                : "text-[#69748a] hover:bg-white"
            }`}
          >
            <Icon className="h-[17px] w-[17px]" />
            <span className="flex-1">{label}</span>
            {count && <span className="text-[10px] text-[#8b9ac0]">{count}</span>}
          </button>
        ))}
      </nav>

      <div className="my-7 h-px bg-[#e5e8f0]" />

      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a5adbf]">
        Mes espaces
      </p>
      {[
        ["Projets & métiers", Hash],
        ["Mon équipe", Users],
        ["Préférences", Settings2],
      ].map(([label, Icon]) => (
        <button
          key={label as string}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold text-[#69748a] hover:bg-white"
        >
          <Icon className="h-[17px] w-[17px]" />
          <span>{label as string}</span>
        </button>
      ))}

      <div className="mt-12 rounded-2xl bg-[#192b58] p-4 text-white">
        <ShieldCheck className="mb-5 h-5 w-5 text-[#a8c3ff]" />
        <p className="text-[13px] font-bold">Un espace sûr pour échanger</p>
        <p className="mt-2 text-[10px] leading-relaxed text-[#b6c5e9]">
          La communauté STSL est réservée à nos collaborateurs.
        </p>
      </div>
    </aside>
  );
}
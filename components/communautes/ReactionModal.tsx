import { X } from "lucide-react";
import { Post } from "@/lib/communautes/types";

interface ReactionModalProps {
  post: Post;
  kind: "likes" | "dislikes";
  onClose: () => void;
}

export default function ReactionModal({ post, kind, onClose }: ReactionModalProps) {
  const users =
    kind === "likes"
      ? ["Marie A.", "Thomas K.", "Sonia M.", "David P."]
      : ["Anonyme collaborateur"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#7188c4]">
              Interactions
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-[#1d2a45]">
              {kind === "likes" ? "Les likes" : "Les dislikes"}
            </h2>
          </div>
          <button
            aria-label="Fermer"
            onClick={onClose}
            className="rounded-lg p-2 text-[#99a3b6] hover:bg-[#f5f6fa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-[12px] text-[#7d879b]">{post.title}</p>

        <div className="max-h-60 space-y-2 overflow-y-auto">
          {users.map((name, index) => (
            <div key={name} className="flex items-center gap-3 rounded-xl bg-[#f8f9fc] p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dce8ff] text-[10px] font-bold text-[#3764b4]">
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-[12px] font-bold text-[#3b4760]">{name}</span>
              <span className="ml-auto text-[10px] text-[#a2aabc]">{index + 1}e</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}